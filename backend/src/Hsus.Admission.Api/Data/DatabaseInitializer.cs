using Hsus.Admission.Api.Configuration;
using Hsus.Admission.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Hsus.Admission.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInitializer");
        var dbContext = scope.ServiceProvider.GetRequiredService<AdmissionDbContext>();
        var options = scope.ServiceProvider.GetRequiredService<IOptions<AdmissionOptions>>().Value;

        const int maxRetries = 10;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Applying EF Core database migrations (attempt {Attempt}/{MaxRetries})...", attempt, maxRetries);
                await dbContext.Database.MigrateAsync(cancellationToken);
                logger.LogInformation("EF Core database migrations applied successfully.");
                break;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                logger.LogWarning(ex, "Database not ready yet on attempt {Attempt}. Retrying in 2 seconds...", attempt);
                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
            }
        }

        if (options.SeedDemoData)
        {
            await SeedInitialDataIfEmptyAsync(dbContext, logger, cancellationToken);
        }
    }

    private static async Task SeedInitialDataIfEmptyAsync(
        AdmissionDbContext dbContext,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await dbContext.AdmissionClasses.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Database already contains admission classes; skipping initial seed.");
            return;
        }

        logger.LogInformation("Seeding initial demo admission classes and baseline records...");

        var startDate = new DateTime(2026, 11, 1, 8, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 11, 30, 23, 59, 59, DateTimeKind.Utc);
        var now = DateTime.UtcNow;

        var seedClasses = new List<AdmissionClass>
        {
            new()
            {
                Id = "class_001",
                Name = "Class 6 - Morning",
                Grade = "Class 6",
                Shift = "Morning",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 40,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_002",
                Name = "Class 6 - Day",
                Grade = "Class 6",
                Shift = "Day",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 40,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_003",
                Name = "Class 7 - Morning",
                Grade = "Class 7",
                Shift = "Morning",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 35,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_004",
                Name = "Class 7 - Day",
                Grade = "Class 7",
                Shift = "Day",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 35,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_005",
                Name = "Class 8 - Morning",
                Grade = "Class 8",
                Shift = "Morning",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 30,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_006",
                Name = "Class 8 - Day",
                Grade = "Class 8",
                Shift = "Day",
                Group = "General",
                AcademicSession = "Session 27",
                TotalSeats = 30,
                FeeAmount = 1500m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_007",
                Name = "Class 9 - Science (Morning)",
                Grade = "Class 9",
                Shift = "Morning",
                Group = "Science",
                AcademicSession = "Session 27",
                TotalSeats = 30,
                FeeAmount = 1800m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_008",
                Name = "Class 9 - Commerce (Day)",
                Grade = "Class 9",
                Shift = "Day",
                Group = "Commerce",
                AcademicSession = "Session 27",
                TotalSeats = 25,
                FeeAmount = 1800m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            },
            new()
            {
                Id = "class_009",
                Name = "Class 10 - Science (Morning)",
                Grade = "Class 10",
                Shift = "Morning",
                Group = "Science",
                AcademicSession = "Session 27",
                TotalSeats = 25,
                FeeAmount = 1800m,
                AdmissionStartDate = startDate,
                AdmissionEndDate = endDate,
                CreatedAt = now
            }
        };

        var seedStudents = new List<Student>
        {
            new() { BirthRegistrationNumber = "20081234567890001", CreatedAt = now.AddDays(-2) },
            new() { BirthRegistrationNumber = "20081234567890002", CreatedAt = now.AddDays(-1.5) },
            new() { BirthRegistrationNumber = "20081234567890003", CreatedAt = now.AddDays(-1) },
            new() { BirthRegistrationNumber = "20081234567890004", CreatedAt = now.AddDays(-0.8) }
        };

        var seedHolds = new List<AdmissionHold>
        {
            new()
            {
                Id = "hold_seed_001",
                ApplicationCode = "HUHS-2026-810231",
                ClassId = "class_001",
                StudentId = "20081234567890001",
                Status = HoldStatus.Confirmed,
                CreatedAt = now.AddDays(-2),
                ExpiresAt = now.AddDays(-2).AddMinutes(10),
                ConfirmedAt = now.AddDays(-2).AddMinutes(3)
            },
            new()
            {
                Id = "hold_seed_002",
                ApplicationCode = "HUHS-2026-810232",
                ClassId = "class_001",
                StudentId = "20081234567890002",
                Status = HoldStatus.Confirmed,
                CreatedAt = now.AddDays(-1.5),
                ExpiresAt = now.AddDays(-1.5).AddMinutes(10),
                ConfirmedAt = now.AddDays(-1.5).AddMinutes(4)
            },
            new()
            {
                Id = "hold_seed_003",
                ApplicationCode = "HUHS-2026-810233",
                ClassId = "class_003",
                StudentId = "20081234567890003",
                Status = HoldStatus.Confirmed,
                CreatedAt = now.AddDays(-1),
                ExpiresAt = now.AddDays(-1).AddMinutes(10),
                ConfirmedAt = now.AddDays(-1).AddMinutes(2)
            },
            new()
            {
                Id = "hold_seed_004",
                ApplicationCode = "HUHS-2026-810234",
                ClassId = "class_007",
                StudentId = "20081234567890004",
                Status = HoldStatus.Confirmed,
                CreatedAt = now.AddDays(-0.8),
                ExpiresAt = now.AddDays(-0.8).AddMinutes(10),
                ConfirmedAt = now.AddDays(-0.8).AddMinutes(2.5)
            }
        };

        dbContext.AdmissionClasses.AddRange(seedClasses);
        dbContext.Students.AddRange(seedStudents);
        dbContext.AdmissionHolds.AddRange(seedHolds);

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Initial demo data seeded successfully ({ClassCount} classes, {HoldCount} confirmed records).",
            seedClasses.Count, seedHolds.Count);
    }
}

