using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Entities;
using Xunit;

namespace Hsus.Admission.IntegrationTests;

[Collection("PostgreSql")]
public class ConcurrencyTests
{
    private const string ConnectionString =
        "Host=localhost;Port=5432;Database=hsus_admission_test;Username=hsus_user;Password=hsus_password;Include Error Detail=true";

    private HttpClient CreateClient(int holdDurationSeconds = 600)
    {
        var factory = new AdmissionApiFactory(ConnectionString, holdDurationSeconds, seedDemoData: false);
        return factory.CreateClient();
    }

    // 18. Concurrent reservation requests:
    // When 25 distinct students simultaneously attempt to reserve seats in a class with only 5 seats:
    // Exactly 5 reservations must succeed (201 Created), 20 must be rejected (409 Conflict),
    // and total allocated seats in PostgreSQL must never exceed 5.
    [Fact]
    public async Task Test18_ConcurrentSeatReservation_NeverExceedsClassCapacity()
    {
        using var client = CreateClient();
        var uniqueSession = $"S_{Guid.NewGuid().ToString("N")[..8]}";

        const int totalSeats = 5;
        const int concurrentStudents = 25;

        // 1. Create a class with exactly 5 seats
        var createRes = await client.PostAsJsonAsync("/classes", new CreateClassRequest
        {
            Name = $"Class 9 - Concurrency ({Guid.NewGuid().ToString("N")[..6]})",
            TotalSeats = totalSeats,
            Grade = "Class 9",
            Shift = "Morning",
            Group = "Science",
            Session = uniqueSession
        });
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var cls = await createRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(cls);

        // 2. Prepare 25 distinct 17-digit student IDs
        var studentIds = Enumerable.Range(1001, concurrentStudents)
            .Select(i => $"2008999900000{i}")
            .ToList();

        var successHolds = new ConcurrentBag<HoldResponseDto>();
        var conflictResponses = new ConcurrentBag<HttpResponseMessage>();
        var otherResponses = new ConcurrentBag<HttpResponseMessage>();

        // 3. Fire all 25 requests simultaneously using Task.WhenAll
        var tasks = studentIds.Select(async studentId =>
        {
            using var requestClient = CreateClient();
            var msg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
            msg.Headers.Add("X-Student-Id", studentId);
            msg.Content = JsonContent.Create(new { studentId });

            var res = await requestClient.SendAsync(msg);
            if (res.StatusCode == HttpStatusCode.Created)
            {
                var hold = await res.Content.ReadFromJsonAsync<HoldResponseDto>();
                if (hold != null) successHolds.Add(hold);
            }
            else if (res.StatusCode == HttpStatusCode.Conflict)
            {
                conflictResponses.Add(res);
            }
            else
            {
                otherResponses.Add(res);
            }
        });

        await Task.WhenAll(tasks);

        // 4. Verify exact counts
        Assert.Empty(otherResponses);
        Assert.Equal(totalSeats, successHolds.Count);
        Assert.Equal(concurrentStudents - totalSeats, conflictResponses.Count);

        // 5. Query PostgreSQL database directly via API to verify strict capacity integrity
        var classCheckRes = await client.GetAsync($"/classes/{cls.Id}");
        var finalClass = await classCheckRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(finalClass);
        Assert.Equal(totalSeats, finalClass.HeldSeats);
        Assert.Equal(0, finalClass.AvailableSeats);
        Assert.Equal(0, finalClass.ConfirmedSeats);
        Assert.Equal(totalSeats, finalClass.TotalSeats);
    }

    // 19. Concurrent requests from the same student to different classes:
    // When the same student fires simultaneous reservation requests to 5 different classes,
    // exactly ONE request must succeed (201 Created), all other 4 requests must fail with 409 Conflict,
    // and the student must have at most 1 active hold in the database.
    [Fact]
    public async Task Test19_ConcurrentRequestsFromSameStudent_AllocatesExactlyOneSeat()
    {
        using var client = CreateClient();
        var uniqueSession = $"S_{Guid.NewGuid().ToString("N")[..8]}";
        var studentId = "20089999999999999";

        // 1. Create 5 different classes with distinct grades in this unique session
        var classIds = new List<string>();
        var grades = new[] { "Class 6", "Class 7", "Class 8", "Class 9", "Class 10" };
        for (int i = 0; i < 5; i++)
        {
            var res = await client.PostAsJsonAsync("/classes", new CreateClassRequest
            {
                Name = $"{grades[i]} - MultiSection {i + 1} ({Guid.NewGuid().ToString("N")[..6]})",
                TotalSeats = 20,
                Grade = grades[i],
                Shift = i % 2 == 0 ? "Day" : "Morning",
                Group = i >= 3 ? "Science" : "General",
                Session = uniqueSession
            });
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();
            Assert.NotNull(cls);
            classIds.Add(cls.Id);
        }

        var successList = new ConcurrentBag<HoldResponseDto>();
        var conflictList = new ConcurrentBag<HttpResponseMessage>();
        var otherList = new ConcurrentBag<HttpResponseMessage>();

        // 2. Fire 5 requests simultaneously for the SAME student to all 5 different classes
        var tasks = classIds.Select(async classId =>
        {
            using var reqClient = CreateClient();
            var msg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
            msg.Headers.Add("X-Student-Id", studentId);
            msg.Content = JsonContent.Create(new { studentId });

            var res = await reqClient.SendAsync(msg);
            if (res.StatusCode == HttpStatusCode.Created)
            {
                var hold = await res.Content.ReadFromJsonAsync<HoldResponseDto>();
                if (hold != null) successList.Add(hold);
            }
            else if (res.StatusCode == HttpStatusCode.Conflict)
            {
                conflictList.Add(res);
            }
            else
            {
                otherList.Add(res);
            }
        });

        await Task.WhenAll(tasks);

        // 3. Exactly 1 request must have succeeded, exactly 4 must have failed with Conflict (409)
        Assert.Empty(otherList);
        Assert.Single(successList);
        Assert.Equal(4, conflictList.Count);

        // 4. Verify student's holds in database via GET /me/holds
        var myHoldsMsg = new HttpRequestMessage(HttpMethod.Get, "/me/holds");
        myHoldsMsg.Headers.Add("X-Student-Id", studentId);
        var myHoldsRes = await client.SendAsync(myHoldsMsg);
        var myHolds = await myHoldsRes.Content.ReadFromJsonAsync<List<HoldResponseDto>>();

        Assert.NotNull(myHolds);
        var activeOrConfirmed = myHolds.Where(h => h.Status == HoldStatus.Held || h.Status == HoldStatus.Confirmed).ToList();
        Assert.Single(activeOrConfirmed);
    }
}
