using System.Net;
using System.Net.Http.Json;
using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Entities;
using Xunit;

namespace Hsus.Admission.IntegrationTests;

[Collection("PostgreSql")]
public class AdmissionApiTests
{
    private const string ConnectionString =
        "Host=localhost;Port=5432;Database=hsus_admission_test;Username=hsus_user;Password=hsus_password;Include Error Detail=true";

    private HttpClient CreateClient(int holdDurationSeconds = 600, bool seedDemoData = false)
    {
        var factory = new AdmissionApiFactory(ConnectionString, holdDurationSeconds, seedDemoData);
        return factory.CreateClient();
    }

    private static string GenerateTestStudentId()
    {
        var randomPart = Random.Shared.NextInt64(1000000000000000L, 9999999999999999L);
        return $"2{randomPart % 1000000000000000L:D15}1";
    }

    private static CreateClassRequest CreateTestClass(
        string grade = "Class 6",
        string shift = "Morning",
        string group = "General",
        int totalSeats = 20,
        string? session = null)
    {
        var uid = Guid.NewGuid().ToString("N")[..6];
        return new CreateClassRequest
        {
            Name = $"{grade} - {shift} ({uid})",
            TotalSeats = totalSeats,
            Grade = grade,
            Shift = shift,
            Group = group,
            Session = session ?? $"TestSession_{Guid.NewGuid().ToString("N")[..8]}"
        };
    }

    // 1. Class creation
    [Fact]
    public async Task Test01_ClassCreation_SucceedsWith201()
    {
        using var client = CreateClient();
        var request = CreateTestClass("Class 6", "Morning", "General", 45);

        var response = await client.PostAsJsonAsync("/classes", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);
        Assert.False(string.IsNullOrWhiteSpace(created.Id));
        Assert.Equal(request.Name, created.Name);
        Assert.Equal(45, created.TotalSeats);
        Assert.Equal(45, created.AvailableSeats);
        Assert.Equal(0, created.HeldSeats);
        Assert.Equal(0, created.ConfirmedSeats);
    }

    // 2. Class listing
    [Fact]
    public async Task Test02_ClassListing_ReturnsClassesWithCalculatedSeats()
    {
        using var client = CreateClient();
        // Ensure at least one class exists
        var createRes = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Morning", "General", 30));
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var response = await client.GetAsync("/classes");
        Assert.True(response.IsSuccessStatusCode);
        var classes = await response.Content.ReadFromJsonAsync<List<ClassResponseDto>>();
        Assert.NotNull(classes);
        Assert.NotEmpty(classes);

        foreach (var cls in classes)
        {
            Assert.Equal(cls.TotalSeats, cls.AvailableSeats + cls.HeldSeats + cls.ConfirmedSeats);
        }
    }

    // 3. Class details
    [Fact]
    public async Task Test03_ClassDetails_ReturnsSpecificClassWithSeatStats()
    {
        using var client = CreateClient();
        var req = CreateTestClass("Class 7", "Day", "General", 30);
        var createRes = await client.PostAsJsonAsync("/classes", req);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var created = await createRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(created);

        var response = await client.GetAsync($"/classes/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var fetched = await response.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(req.Name, fetched.Name);
        Assert.Equal(30, fetched.TotalSeats);
    }

    // 4. Successful seat reservation
    [Fact]
    public async Task Test04_SuccessfulSeatReservation_CreatesHoldAndDecrementsAvailableSeats()
    {
        using var client = CreateClient();
        var createRes = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 8", "Morning", "General", 20));
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var cls = await createRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(cls);

        var studentId = GenerateTestStudentId();
        var requestMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        requestMsg.Headers.Add("X-Student-Id", studentId);
        requestMsg.Content = JsonContent.Create(new { studentId });

        var response = await client.SendAsync(requestMsg);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var hold = await response.Content.ReadFromJsonAsync<HoldResponseDto>();
        Assert.NotNull(hold);
        Assert.Equal(HoldStatus.Held, hold.Status);
        Assert.Equal(studentId, hold.StudentId);
        Assert.Equal(cls.Id, hold.ClassId);
        Assert.True(hold.ExpiresAt > DateTime.UtcNow);

        // Verify class available seats decremented and held seats incremented
        var classRes = await client.GetAsync($"/classes/{cls.Id}");
        var updatedClass = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(updatedClass);
        Assert.Equal(1, updatedClass.HeldSeats);
        Assert.Equal(19, updatedClass.AvailableSeats);
    }

    // 5. Invalid student ID
    [Fact]
    public async Task Test05_InvalidStudentId_Returns400BadRequest()
    {
        using var client = CreateClient();
        var createRes = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Morning", "General", 10));
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var cls = await createRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(cls);

        // 16 digits (too short)
        var msg16 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        msg16.Headers.Add("X-Student-Id", "2008123456789001");
        var res16 = await client.SendAsync(msg16);
        Assert.Equal(HttpStatusCode.BadRequest, res16.StatusCode);

        // 18 digits (too long)
        var msg18 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        msg18.Headers.Add("X-Student-Id", "200812345678900123");
        var res18 = await client.SendAsync(msg18);
        Assert.Equal(HttpStatusCode.BadRequest, res18.StatusCode);

        // Letters included
        var msgLetters = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        msgLetters.Headers.Add("X-Student-Id", "2008123456789001A");
        var resLetters = await client.SendAsync(msgLetters);
        Assert.Equal(HttpStatusCode.BadRequest, resLetters.StatusCode);
    }

    // 6. Insufficient seats
    [Fact]
    public async Task Test06_InsufficientSeats_Returns409ConflictWhenClassFull()
    {
        using var client = CreateClient();
        var createRes = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 7", "Day", "General", 1));
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var cls = await createRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.NotNull(cls);

        var student1 = GenerateTestStudentId();
        var student2 = GenerateTestStudentId();

        // Student 1 reserves the only seat
        var msg1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        msg1.Headers.Add("X-Student-Id", student1);
        var res1 = await client.SendAsync(msg1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Student 2 attempts to reserve full class
        var msg2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        msg2.Headers.Add("X-Student-Id", student2);
        var res2 = await client.SendAsync(msg2);

        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    // 7. Duplicate active application
    [Fact]
    public async Task Test07_DuplicateActiveApplication_Returns409Conflict()
    {
        using var client = CreateClient();
        var session = $"TestSession_{Guid.NewGuid().ToString("N")[..8]}";
        var studentId = GenerateTestStudentId();

        var resA = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Morning", "General", 20, session));
        Assert.Equal(HttpStatusCode.Created, resA.StatusCode);
        var c1 = await resA.Content.ReadFromJsonAsync<ClassResponseDto>();

        var resB = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Day", "General", 20, session));
        Assert.Equal(HttpStatusCode.Created, resB.StatusCode);
        var c2 = await resB.Content.ReadFromJsonAsync<ClassResponseDto>();

        // Hold in Class 1 succeeds
        var msg1 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{c1!.Id}/holds");
        msg1.Headers.Add("X-Student-Id", studentId);
        var res1 = await client.SendAsync(msg1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Hold in Class 2 for same student must be rejected with 409
        var msg2 = new HttpRequestMessage(HttpMethod.Post, $"/classes/{c2!.Id}/holds");
        msg2.Headers.Add("X-Student-Id", studentId);
        var res2 = await client.SendAsync(msg2);
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    // 8. Student already admitted in another class
    [Fact]
    public async Task Test08_StudentAlreadyAdmitted_PermanentlyBlocksNewHold()
    {
        using var client = CreateClient();
        var session = $"TestSession_{Guid.NewGuid().ToString("N")[..8]}";
        var studentId = GenerateTestStudentId();

        var resA = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 9", "Morning", "Science", 20, session));
        Assert.Equal(HttpStatusCode.Created, resA.StatusCode);
        var c1 = await resA.Content.ReadFromJsonAsync<ClassResponseDto>();

        var resB = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 9", "Day", "Science", 20, session));
        Assert.Equal(HttpStatusCode.Created, resB.StatusCode);
        var c2 = await resB.Content.ReadFromJsonAsync<ClassResponseDto>();

        // Hold and confirm in Class 1
        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{c1!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        var confirmMsg = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold!.HoldId}/confirm");
        confirmMsg.Headers.Add("X-Student-Id", studentId);
        var confirmRes = await client.SendAsync(confirmMsg);
        Assert.Equal(HttpStatusCode.OK, confirmRes.StatusCode);

        // Attempt new hold in Class 2 -> 409 Conflict
        var secondHoldMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{c2!.Id}/holds");
        secondHoldMsg.Headers.Add("X-Student-Id", studentId);
        var secondRes = await client.SendAsync(secondHoldMsg);
        Assert.Equal(HttpStatusCode.Conflict, secondRes.StatusCode);
    }

    // 9. Application expiration
    [Fact]
    public async Task Test09_ApplicationExpiration_AutomaticallyExpiresOverdueHold()
    {
        // Configure short 1-second hold duration
        using var client = CreateClient(holdDurationSeconds: 1);
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 8", "Morning", "General", 10));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        // Wait 2.1 seconds for hold to expire
        await Task.Delay(2100);

        // Query hold details
        var getMsg = new HttpRequestMessage(HttpMethod.Get, $"/holds/{hold!.HoldId}");
        getMsg.Headers.Add("X-Student-Id", studentId);
        var getRes = await client.SendAsync(getMsg);

        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
        var expiredHold = await getRes.Content.ReadFromJsonAsync<HoldResponseDto>();
        Assert.Equal(HoldStatus.Expired, expiredHold!.Status);
    }

    // 10. Confirmation before expiration
    [Fact]
    public async Task Test10_ConfirmationBeforeExpiration_ChangesStatusToConfirmed()
    {
        using var client = CreateClient();
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 7", "Morning", "General", 15));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        var confirmMsg = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold!.HoldId}/confirm");
        confirmMsg.Headers.Add("X-Student-Id", studentId);
        var confirmRes = await client.SendAsync(confirmMsg);

        Assert.Equal(HttpStatusCode.OK, confirmRes.StatusCode);
        var confirmed = await confirmRes.Content.ReadFromJsonAsync<HoldResponseDto>();
        Assert.Equal(HoldStatus.Confirmed, confirmed!.Status);
        Assert.NotNull(confirmed.ConfirmedAt);

        // Class stats reflect 1 confirmed seat and 0 held seats
        var classRes = await client.GetAsync($"/classes/{cls.Id}");
        var updated = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.Equal(1, updated!.ConfirmedSeats);
        Assert.Equal(0, updated.HeldSeats);
    }

    // 11. Confirmation after expiration
    [Fact]
    public async Task Test11_ConfirmationAfterExpiration_Returns409Conflict()
    {
        using var client = CreateClient(holdDurationSeconds: 1);
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Day", "General", 15));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        // Wait past 1s expiration
        await Task.Delay(2100);

        var confirmMsg = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold!.HoldId}/confirm");
        confirmMsg.Headers.Add("X-Student-Id", studentId);
        var confirmRes = await client.SendAsync(confirmMsg);

        Assert.Equal(HttpStatusCode.Conflict, confirmRes.StatusCode);
    }

    // 12. Repeated confirmation
    [Fact]
    public async Task Test12_RepeatedConfirmation_IsIdempotentAndDoesNotDoubleCount()
    {
        using var client = CreateClient();
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 10", "Morning", "Science", 25));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        // First confirm
        var confirm1 = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold!.HoldId}/confirm");
        confirm1.Headers.Add("X-Student-Id", studentId);
        var res1 = await client.SendAsync(confirm1);
        Assert.Equal(HttpStatusCode.OK, res1.StatusCode);

        // Second confirm
        var confirm2 = new HttpRequestMessage(HttpMethod.Post, $"/holds/{hold.HoldId}/confirm");
        confirm2.Headers.Add("X-Student-Id", studentId);
        var res2 = await client.SendAsync(confirm2);
        Assert.Equal(HttpStatusCode.OK, res2.StatusCode);

        // Confirmed seats must be exactly 1, not 2
        var classRes = await client.GetAsync($"/classes/{cls.Id}");
        var updated = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.Equal(1, updated!.ConfirmedSeats);
    }

    // 13. Application cancellation
    [Fact]
    public async Task Test13_ApplicationCancellation_Returns204AndMarksCancelled()
    {
        using var client = CreateClient();
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 8", "Day", "General", 20));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        var cancelMsg = new HttpRequestMessage(HttpMethod.Delete, $"/holds/{hold!.HoldId}");
        cancelMsg.Headers.Add("X-Student-Id", studentId);
        var cancelRes = await client.SendAsync(cancelMsg);

        Assert.Equal(HttpStatusCode.NoContent, cancelRes.StatusCode);

        // Check hold status changed to CANCELLED
        var getMsg = new HttpRequestMessage(HttpMethod.Get, $"/holds/{hold.HoldId}");
        getMsg.Headers.Add("X-Student-Id", studentId);
        var getRes = await client.SendAsync(getMsg);
        var updatedHold = await getRes.Content.ReadFromJsonAsync<HoldResponseDto>();
        Assert.Equal(HoldStatus.Cancelled, updatedHold!.Status);
        Assert.NotNull(updatedHold.CancelledAt);
    }

    // 14. Student data isolation
    [Fact]
    public async Task Test14_StudentDataIsolation_StudentCannotAccessOtherStudentsHolds()
    {
        using var client = CreateClient();
        var studentA = GenerateTestStudentId();
        var studentB = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 6", "Morning", "General", 20));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        // Student A reserves hold
        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentA);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var holdA = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        // Student B tries to view Student A's hold -> 403 Forbidden
        var viewMsg = new HttpRequestMessage(HttpMethod.Get, $"/holds/{holdA!.HoldId}");
        viewMsg.Headers.Add("X-Student-Id", studentB);
        var viewRes = await client.SendAsync(viewMsg);
        Assert.Equal(HttpStatusCode.Forbidden, viewRes.StatusCode);

        // Student B tries to confirm Student A's hold -> 403 Forbidden
        var confirmMsg = new HttpRequestMessage(HttpMethod.Post, $"/holds/{holdA.HoldId}/confirm");
        confirmMsg.Headers.Add("X-Student-Id", studentB);
        var confirmRes = await client.SendAsync(confirmMsg);
        Assert.Equal(HttpStatusCode.Forbidden, confirmRes.StatusCode);

        // Student B tries to cancel Student A's hold -> 403 Forbidden
        var cancelMsg = new HttpRequestMessage(HttpMethod.Delete, $"/holds/{holdA.HoldId}");
        cancelMsg.Headers.Add("X-Student-Id", studentB);
        var cancelRes = await client.SendAsync(cancelMsg);
        Assert.Equal(HttpStatusCode.Forbidden, cancelRes.StatusCode);

        // GET /me/holds for Student B must not return Student A's holds
        var myHoldsMsg = new HttpRequestMessage(HttpMethod.Get, "/me/holds");
        myHoldsMsg.Headers.Add("X-Student-Id", studentB);
        var myHoldsRes = await client.SendAsync(myHoldsMsg);
        var bHolds = await myHoldsRes.Content.ReadFromJsonAsync<List<HoldResponseDto>>();
        Assert.NotNull(bHolds);
        Assert.DoesNotContain(bHolds, h => h.HoldId == holdA.HoldId);
    }

    // 15. Duplicate class prevention
    [Fact]
    public async Task Test15_DuplicateClassPrevention_Throws409ConflictOnDuplicateSection()
    {
        using var client = CreateClient();
        var grade = "Class 9";
        var shift = "Day";
        var group = "Commerce";
        var session = $"Session 27_{Guid.NewGuid().ToString("N")[..4]}";

        var req1 = new CreateClassRequest
        {
            Name = $"Class 9 - Commerce ({shift})",
            TotalSeats = 30,
            Grade = grade,
            Shift = shift,
            Group = group,
            Session = session
        };

        var res1 = await client.PostAsJsonAsync("/classes", req1);
        Assert.Equal(HttpStatusCode.Created, res1.StatusCode);

        // Second creation attempt with identical parameters
        var res2 = await client.PostAsJsonAsync("/classes", req1);
        Assert.Equal(HttpStatusCode.Conflict, res2.StatusCode);
    }

    // 16. Seat release after expiration
    [Fact]
    public async Task Test16_SeatReleaseAfterExpiration_RestoresAvailableSeatsAndAllowsReapplication()
    {
        using var client = CreateClient(holdDurationSeconds: 1);
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 7", "Morning", "General", 1));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);

        // Wait for hold to expire
        await Task.Delay(2100);

        // Available seats should be back to 1
        var classRes = await client.GetAsync($"/classes/{cls.Id}");
        var updated = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.Equal(1, updated!.AvailableSeats);
        Assert.Equal(0, updated.HeldSeats);

        // Student should now be able to apply again
        var newHoldMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        newHoldMsg.Headers.Add("X-Student-Id", studentId);
        var newHoldRes = await client.SendAsync(newHoldMsg);
        Assert.Equal(HttpStatusCode.Created, newHoldRes.StatusCode);
    }

    // 17. Seat release after cancellation
    [Fact]
    public async Task Test17_SeatReleaseAfterCancellation_RestoresAvailableSeatsAndAllowsReapplication()
    {
        using var client = CreateClient();
        var studentId = GenerateTestStudentId();

        var res = await client.PostAsJsonAsync("/classes", CreateTestClass("Class 8", "Day", "General", 1));
        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
        var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();

        var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls!.Id}/holds");
        holdMsg.Headers.Add("X-Student-Id", studentId);
        var holdRes = await client.SendAsync(holdMsg);
        Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
        var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();

        // Cancel
        var cancelMsg = new HttpRequestMessage(HttpMethod.Delete, $"/holds/{hold!.HoldId}");
        cancelMsg.Headers.Add("X-Student-Id", studentId);
        var cancelRes = await client.SendAsync(cancelMsg);
        Assert.Equal(HttpStatusCode.NoContent, cancelRes.StatusCode);

        // Available seats restored
        var classRes = await client.GetAsync($"/classes/{cls.Id}");
        var updated = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
        Assert.Equal(1, updated!.AvailableSeats);
        Assert.Equal(0, updated.HeldSeats);

        // Student can reserve again
        var newHoldMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{cls.Id}/holds");
        newHoldMsg.Headers.Add("X-Student-Id", studentId);
        var newHoldRes = await client.SendAsync(newHoldMsg);
        Assert.Equal(HttpStatusCode.Created, newHoldRes.StatusCode);
    }

    // 20. Database persistence after backend restart
    [Fact]
    public async Task Test20_DatabasePersistence_RecordsSurviveNewClientInstance()
    {
        var studentId = GenerateTestStudentId();
        string holdId;
        string classId;

        // Instance 1: Create class, hold, confirm
        {
            using var client1 = CreateClient();
            var res = await client1.PostAsJsonAsync("/classes", CreateTestClass("Class 9", "Morning", "Science", 30));
            Assert.Equal(HttpStatusCode.Created, res.StatusCode);
            var cls = await res.Content.ReadFromJsonAsync<ClassResponseDto>();
            classId = cls!.Id;

            var holdMsg = new HttpRequestMessage(HttpMethod.Post, $"/classes/{classId}/holds");
            holdMsg.Headers.Add("X-Student-Id", studentId);
            var holdRes = await client1.SendAsync(holdMsg);
            Assert.Equal(HttpStatusCode.Created, holdRes.StatusCode);
            var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();
            holdId = hold!.HoldId;

            var confirmMsg = new HttpRequestMessage(HttpMethod.Post, $"/holds/{holdId}/confirm");
            confirmMsg.Headers.Add("X-Student-Id", studentId);
            var confirmRes = await client1.SendAsync(confirmMsg);
            Assert.Equal(HttpStatusCode.OK, confirmRes.StatusCode);
        }

        // Instance 2: Simulate backend restart with a fresh factory instance
        {
            using var client2 = CreateClient();

            var classRes = await client2.GetAsync($"/classes/{classId}");
            Assert.Equal(HttpStatusCode.OK, classRes.StatusCode);
            var cls = await classRes.Content.ReadFromJsonAsync<ClassResponseDto>();
            Assert.NotNull(cls);
            Assert.Equal(1, cls.ConfirmedSeats);

            var holdMsg = new HttpRequestMessage(HttpMethod.Get, $"/holds/{holdId}");
            holdMsg.Headers.Add("X-Student-Id", studentId);
            var holdRes = await client2.SendAsync(holdMsg);
            Assert.Equal(HttpStatusCode.OK, holdRes.StatusCode);
            var hold = await holdRes.Content.ReadFromJsonAsync<HoldResponseDto>();
            Assert.NotNull(hold);
            Assert.Equal(HoldStatus.Confirmed, hold.Status);
        }
    }
}
