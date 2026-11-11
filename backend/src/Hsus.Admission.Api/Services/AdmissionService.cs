using System.Data;
using System.Text.RegularExpressions;
using Hsus.Admission.Api.Configuration;
using Hsus.Admission.Api.Data;
using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Entities;
using Hsus.Admission.Api.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;

namespace Hsus.Admission.Api.Services;

public partial class AdmissionService : IAdmissionService
{
    private readonly AdmissionDbContext _dbContext;
    private readonly AdmissionOptions _options;
    private readonly ILogger<AdmissionService> _logger;

    [GeneratedRegex(@"^\d{17}$")]
    private static partial Regex StudentIdRegex();

    [GeneratedRegex(@"Class\s*(\d+)", RegexOptions.IgnoreCase)]
    private static partial Regex ClassGradeRegex();

    public AdmissionService(
        AdmissionDbContext dbContext,
        IOptionsSnapshot<AdmissionOptions> options,
        ILogger<AdmissionService> logger)
    {
        _dbContext = dbContext;
        _options = options.Value;
        _logger = logger;
    }

    public static string ValidateAndNormalizeStudentId(string? studentIdHeader)
    {
        var cleanId = (studentIdHeader ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(cleanId) || !StudentIdRegex().IsMatch(cleanId))
        {
            throw new BadRequestDomainException(
                "A valid 17-digit birth registration number is required in the X-Student-Id header.");
        }

        return cleanId;
    }

    public async Task<int> ExpireOverdueHoldsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var expiredCount = await _dbContext.AdmissionHolds
            .Where(h => h.Status == HoldStatus.Held && h.ExpiresAt <= now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(h => h.Status, HoldStatus.Expired)
                .SetProperty(h => h.ExpiredAt, now),
                cancellationToken);

        if (expiredCount > 0)
        {
            _logger.LogInformation("Automatically expired {ExpiredCount} overdue seat holds at {Timestamp}.", expiredCount, now);
        }

        return expiredCount;
    }

    public async Task<ClassResponseDto> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
        {
            throw new BadRequestDomainException("Request body is required.");
        }

        if (request.TotalSeats <= 0)
        {
            throw new BadRequestDomainException("Total seats must be a positive integer greater than 0.");
        }

        if (request.TotalSeats > 500)
        {
            throw new BadRequestDomainException("Total seats cannot exceed 500 per class.");
        }

        var rawName = (request.Name ?? string.Empty).Trim();
        var rawGrade = (request.Grade ?? string.Empty).Trim();
        var rawShift = (request.Shift ?? string.Empty).Trim();
        var rawGroup = (request.Group ?? string.Empty).Trim();
        var rawSession = (request.AcademicSession ?? request.Session ?? "Session 27").Trim();

        if (string.IsNullOrEmpty(rawName) && string.IsNullOrEmpty(rawGrade))
        {
            throw new BadRequestDomainException("Class name is required.");
        }

        if (rawSession.Equals("2027", StringComparison.OrdinalIgnoreCase) ||
            rawSession.Equals("Session 2027", StringComparison.OrdinalIgnoreCase))
        {
            rawSession = "Session 27";
        }

        string targetGrade;
        string targetShift;
        string targetGroup;

        var gradeMatch = ClassGradeRegex().Match(string.IsNullOrEmpty(rawGrade) ? rawName : rawGrade);
        bool hasExplicitGrade = !string.IsNullOrEmpty(rawGrade);

        if (hasExplicitGrade)
        {
            var validGrades = new[] { "Class 6", "Class 7", "Class 8", "Class 9", "Class 10" };
            if (!validGrades.Contains(rawGrade, StringComparer.OrdinalIgnoreCase))
            {
                throw new BadRequestDomainException(
                    $"Invalid grade selected: \"{rawGrade}\". Must be Class 6 through Class 10.");
            }
            targetGrade = validGrades.First(g => g.Equals(rawGrade, StringComparison.OrdinalIgnoreCase));
        }
        else if (gradeMatch.Success)
        {
            targetGrade = $"Class {gradeMatch.Groups[1].Value}";
        }
        else
        {
            // Support custom class names sent via POST /classes { "name": "...", "totalSeats": ... }
            targetGrade = rawName;
        }

        // Determine Shift
        if (!string.IsNullOrEmpty(rawShift))
        {
            var validShifts = new[] { "Morning", "Day" };
            if (!validShifts.Contains(rawShift, StringComparer.OrdinalIgnoreCase))
            {
                throw new BadRequestDomainException($"Invalid shift selected: \"{rawShift}\". Must be Morning or Day.");
            }
            targetShift = validShifts.First(s => s.Equals(rawShift, StringComparison.OrdinalIgnoreCase));
        }
        else if (rawName.Contains("day", StringComparison.OrdinalIgnoreCase))
        {
            targetShift = "Day";
        }
        else
        {
            targetShift = "Morning";
        }

        bool isHigherGrade = targetGrade.Equals("Class 9", StringComparison.OrdinalIgnoreCase) ||
                             targetGrade.Equals("Class 10", StringComparison.OrdinalIgnoreCase);

        // Determine Group / Discipline
        if (!string.IsNullOrEmpty(rawGroup))
        {
            if (isHigherGrade)
            {
                var validGroups = new[] { "Science", "Commerce", "Arts" };
                if (rawGroup.Contains("business", StringComparison.OrdinalIgnoreCase)) rawGroup = "Commerce";
                if (rawGroup.Contains("humanities", StringComparison.OrdinalIgnoreCase)) rawGroup = "Arts";

                if (!validGroups.Contains(rawGroup, StringComparer.OrdinalIgnoreCase))
                {
                    throw new BadRequestDomainException($"{targetGrade} requires a discipline group: Science, Commerce, or Arts.");
                }
                targetGroup = validGroups.First(g => g.Equals(rawGroup, StringComparison.OrdinalIgnoreCase));
            }
            else
            {
                targetGroup = "General";
            }
        }
        else if (rawName.Contains("science", StringComparison.OrdinalIgnoreCase))
        {
            targetGroup = "Science";
        }
        else if (rawName.Contains("commerce", StringComparison.OrdinalIgnoreCase) ||
                 rawName.Contains("business", StringComparison.OrdinalIgnoreCase))
        {
            targetGroup = "Commerce";
        }
        else if (rawName.Contains("arts", StringComparison.OrdinalIgnoreCase) ||
                 rawName.Contains("humanities", StringComparison.OrdinalIgnoreCase))
        {
            targetGroup = "Arts";
        }
        else
        {
            targetGroup = isHigherGrade ? "Science" : "General";
        }

        var finalName = !string.IsNullOrEmpty(rawName)
            ? rawName
            : (isHigherGrade
                ? $"{targetGrade} - {targetGroup} ({targetShift})"
                : $"{targetGrade} - {targetShift}");

        decimal feeAmount = request.FeeAmount ?? request.Fee ?? (isHigherGrade ? 1800m : 1500m);
        if (feeAmount <= 0)
        {
            feeAmount = isHigherGrade ? 1800m : 1500m;
        }

        // Check for duplicate class by Name+Session or Grade+Shift+Group+Session
        var duplicateExists = await _dbContext.AdmissionClasses
            .AnyAsync(c =>
                c.AcademicSession.ToLower() == rawSession.ToLower() &&
                (c.Name.ToLower() == finalName.ToLower() ||
                 (c.Grade.ToLower() == targetGrade.ToLower() &&
                  c.Shift.ToLower() == targetShift.ToLower() &&
                  c.Group.ToLower() == targetGroup.ToLower())),
                cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictDomainException(
                $"This class already exists: \"{finalName}\" ({targetGrade}, {targetShift}, {targetGroup}) is already created for {rawSession}.");
        }

        var now = DateTime.UtcNow;
        var newClass = new AdmissionClass
        {
            Id = $"c_{Guid.NewGuid():N}"[..14],
            Name = finalName,
            Grade = targetGrade,
            Shift = targetShift,
            Group = targetGroup,
            AcademicSession = rawSession,
            TotalSeats = request.TotalSeats,
            FeeAmount = feeAmount,
            AdmissionStartDate = (request.AdmissionStartDate ?? new DateTime(2026, 11, 1, 8, 0, 0, DateTimeKind.Utc)).ToUniversalTime(),
            AdmissionEndDate = (request.AdmissionEndDate ?? new DateTime(2026, 11, 30, 23, 59, 59, DateTimeKind.Utc)).ToUniversalTime(),
            CreatedAt = now
        };

        _dbContext.AdmissionClasses.Add(newClass);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            throw new ConflictDomainException(
                $"This class already exists: \"{finalName}\" is already created for {rawSession}.");
        }

        _logger.LogInformation("Created new admission class {ClassId} ({ClassName}) with {TotalSeats} seats.",
            newClass.Id, newClass.Name, newClass.TotalSeats);

        return MapClassToDto(newClass, heldSeats: 0, confirmedSeats: 0);
    }

    public async Task<List<ClassResponseDto>> GetClassesAsync(CancellationToken cancellationToken = default)
    {
        await ExpireOverdueHoldsAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var classesWithCounts = await _dbContext.AdmissionClasses
            .AsNoTracking()
            .OrderBy(c => c.CreatedAt)
            .ThenBy(c => c.Id)
            .Select(c => new
            {
                Class = c,
                HeldSeats = c.Holds.Count(h => h.Status == HoldStatus.Held && h.ExpiresAt > now),
                ConfirmedSeats = c.Holds.Count(h => h.Status == HoldStatus.Confirmed)
            })
            .ToListAsync(cancellationToken);

        return classesWithCounts
            .Select(x => MapClassToDto(x.Class, x.HeldSeats, x.ConfirmedSeats))
            .ToList();
    }

    public async Task<ClassResponseDto> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default)
    {
        await ExpireOverdueHoldsAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var classWithCounts = await _dbContext.AdmissionClasses
            .AsNoTracking()
            .Where(c => c.Id == classId)
            .Select(c => new
            {
                Class = c,
                HeldSeats = c.Holds.Count(h => h.Status == HoldStatus.Held && h.ExpiresAt > now),
                ConfirmedSeats = c.Holds.Count(h => h.Status == HoldStatus.Confirmed)
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (classWithCounts == null)
        {
            throw new NotFoundDomainException($"Admission class \"{classId}\" was not found.");
        }

        return MapClassToDto(classWithCounts.Class, classWithCounts.HeldSeats, classWithCounts.ConfirmedSeats);
    }

    public async Task<HoldResponseDto> CreateHoldAsync(
        string classId,
        string? studentIdHeader,
        CancellationToken cancellationToken = default)
    {
        var cleanStudentId = ValidateAndNormalizeStudentId(studentIdHeader);
        var holdDurationSeconds = _options.HoldDurationSeconds > 0 ? _options.HoldDurationSeconds : 600;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var now = DateTime.UtcNow;

        // 1. Upsert Student row and acquire a row-level lock (FOR UPDATE) on the student record.
        //    Locking in strict global table order (students -> admission_classes) guarantees deadlock-free
        //    serialization of both per-student concurrent requests and per-class concurrent requests.
        await _dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            INSERT INTO students ("BirthRegistrationNumber", "CreatedAt")
            VALUES ({cleanStudentId}, {now})
            ON CONFLICT ("BirthRegistrationNumber") DO NOTHING
            """,
            cancellationToken);

        var lockedStudent = await _dbContext.Students
            .FromSqlInterpolated(
                $"""
                SELECT * FROM students
                WHERE "BirthRegistrationNumber" = {cleanStudentId}
                FOR UPDATE
                """)
            .FirstOrDefaultAsync(cancellationToken);

        // 2. Acquire a row-level lock (FOR UPDATE) on the requested AdmissionClass row.
        var lockedClass = await _dbContext.AdmissionClasses
            .FromSqlInterpolated(
                $"""
                SELECT * FROM admission_classes
                WHERE "Id" = {classId}
                FOR UPDATE
                """)
            .FirstOrDefaultAsync(cancellationToken);

        if (lockedClass == null)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new NotFoundDomainException($"The selected class \"{classId}\" does not exist.");
        }

        // 3. Immediately expire any overdue holds for this student or this class inside the transaction
        //    so released seats and the student's partial unique index slot are freed atomically.
        await _dbContext.AdmissionHolds
            .Where(h => h.Status == HoldStatus.Held && h.ExpiresAt <= now &&
                        (h.StudentId == cleanStudentId || h.ClassId == classId))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(h => h.Status, HoldStatus.Expired)
                .SetProperty(h => h.ExpiredAt, now),
                cancellationToken);

        // 4. Enforce Global Single-Admission Rule across ALL classes and shifts.
        var existingActiveOrConfirmed = await _dbContext.AdmissionHolds
            .Include(h => h.AdmissionClass)
            .AsNoTracking()
            .Where(h => h.StudentId == cleanStudentId &&
                        (h.Status == HoldStatus.Confirmed || (h.Status == HoldStatus.Held && h.ExpiresAt > now)))
            .FirstOrDefaultAsync(cancellationToken);

        if (existingActiveOrConfirmed != null)
        {
            await transaction.RollbackAsync(cancellationToken);
            var existingClassName = existingActiveOrConfirmed.AdmissionClass?.Name ?? existingActiveOrConfirmed.ClassId;

            if (existingActiveOrConfirmed.Status == HoldStatus.Confirmed)
            {
                throw new ConflictDomainException(
                    $"Admission already confirmed: You have confirmed admission in \"{existingClassName}\". You cannot apply to another class.");
            }

            throw new ConflictDomainException(
                $"Active reservation exists: You already have an active seat hold in \"{existingClassName}\". Cancel the active reservation before selecting another class.");
        }

        // 5. Verify seat capacity under the exclusive class row lock.
        var occupiedSeats = await _dbContext.AdmissionHolds
            .Where(h => h.ClassId == classId &&
                        (h.Status == HoldStatus.Confirmed || (h.Status == HoldStatus.Held && h.ExpiresAt > now)))
            .CountAsync(cancellationToken);

        if (occupiedSeats >= lockedClass.TotalSeats)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictDomainException(
                $"No seats available: \"{lockedClass.Name}\" is currently full. Please check back later or choose another class.");
        }

        // 6. Create the new hold record.
        var expiresAt = now.AddSeconds(holdDurationSeconds);
        var newHold = new AdmissionHold
        {
            Id = $"h_{Guid.NewGuid():N}"[..14],
            ApplicationCode = GenerateApplicationCode(),
            ClassId = lockedClass.Id,
            StudentId = cleanStudentId,
            Status = HoldStatus.Held,
            CreatedAt = now,
            ExpiresAt = expiresAt
        };

        _dbContext.AdmissionHolds.Add(newHold);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictDomainException(
                "Active reservation or confirmed admission already exists for this student.");
        }

        _logger.LogInformation(
            "Created seat hold {HoldId} for student {StudentId} in class {ClassId}; expires at {ExpiresAt}.",
            newHold.Id, cleanStudentId, lockedClass.Id, expiresAt);

        return MapHoldToDto(newHold, lockedClass, now);
    }

    public async Task<HoldResponseDto> GetHoldByIdAsync(
        string holdId,
        string? studentIdHeader,
        CancellationToken cancellationToken = default)
    {
        var cleanStudentId = ValidateAndNormalizeStudentId(studentIdHeader);
        await ExpireOverdueHoldsAsync(cancellationToken);

        var hold = await _dbContext.AdmissionHolds
            .Include(h => h.AdmissionClass)
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

        if (hold == null)
        {
            throw new NotFoundDomainException($"Application reservation \"{holdId}\" was not found.");
        }

        if (!string.Equals(hold.StudentId, cleanStudentId, StringComparison.Ordinal))
        {
            throw new ForbiddenDomainException("This application does not belong to the active student identification.");
        }

        return MapHoldToDto(hold, hold.AdmissionClass, DateTime.UtcNow);
    }

    public async Task<HoldResponseDto> ConfirmHoldAsync(
        string holdId,
        string? studentIdHeader,
        CancellationToken cancellationToken = default)
    {
        var cleanStudentId = ValidateAndNormalizeStudentId(studentIdHeader);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var hold = await _dbContext.AdmissionHolds
            .FromSqlInterpolated(
                $"""
                SELECT * FROM admission_holds
                WHERE "Id" = {holdId}
                FOR UPDATE
                """)
            .FirstOrDefaultAsync(cancellationToken);

        if (hold == null)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new NotFoundDomainException($"Application reservation \"{holdId}\" was not found.");
        }

        if (!string.Equals(hold.StudentId, cleanStudentId, StringComparison.Ordinal))
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ForbiddenDomainException("This application does not belong to the active student identification.");
        }

        var admissionClass = await _dbContext.AdmissionClasses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == hold.ClassId, cancellationToken);

        var now = DateTime.UtcNow;

        // Idempotent handling: repeated confirmation requests on an already CONFIRMED hold
        // return the confirmed state without modifying ConfirmedAt or increasing confirmed seats.
        if (hold.Status == HoldStatus.Confirmed)
        {
            await transaction.CommitAsync(cancellationToken);
            return MapHoldToDto(hold, admissionClass, now);
        }

        if (hold.Status == HoldStatus.Cancelled)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictDomainException("This reservation was cancelled and cannot be confirmed.");
        }

        if (hold.Status == HoldStatus.Expired || hold.ExpiresAt <= now)
        {
            if (hold.Status == HoldStatus.Held)
            {
                hold.Status = HoldStatus.Expired;
                hold.ExpiredAt = now;
                await _dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            else
            {
                await transaction.RollbackAsync(cancellationToken);
            }

            throw new ConflictDomainException(
                "Reservation expired: The temporary hold period has ended and the seat has been released.");
        }

        hold.Status = HoldStatus.Confirmed;
        hold.ConfirmedAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        _logger.LogInformation("Confirmed admission hold {HoldId} for student {StudentId} in class {ClassId}.",
            hold.Id, cleanStudentId, hold.ClassId);

        return MapHoldToDto(hold, admissionClass, now);
    }

    public async Task CancelHoldAsync(
        string holdId,
        string? studentIdHeader,
        CancellationToken cancellationToken = default)
    {
        var cleanStudentId = ValidateAndNormalizeStudentId(studentIdHeader);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var hold = await _dbContext.AdmissionHolds
            .FromSqlInterpolated(
                $"""
                SELECT * FROM admission_holds
                WHERE "Id" = {holdId}
                FOR UPDATE
                """)
            .FirstOrDefaultAsync(cancellationToken);

        if (hold == null)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new NotFoundDomainException($"Application reservation \"{holdId}\" was not found.");
        }

        if (!string.Equals(hold.StudentId, cleanStudentId, StringComparison.Ordinal))
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ForbiddenDomainException("This application does not belong to the active student identification.");
        }

        var now = DateTime.UtcNow;

        if (hold.Status == HoldStatus.Confirmed)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new ConflictDomainException("Cannot cancel an admission that has already been confirmed.");
        }

        if (hold.Status == HoldStatus.Expired || hold.ExpiresAt <= now)
        {
            if (hold.Status == HoldStatus.Held)
            {
                hold.Status = HoldStatus.Expired;
                hold.ExpiredAt = now;
                await _dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
            }
            else
            {
                await transaction.RollbackAsync(cancellationToken);
            }

            throw new ConflictDomainException("Reservation has already expired.");
        }

        if (hold.Status == HoldStatus.Cancelled)
        {
            await transaction.CommitAsync(cancellationToken);
            return;
        }

        hold.Status = HoldStatus.Cancelled;
        hold.CancelledAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        _logger.LogInformation("Cancelled seat hold {HoldId} for student {StudentId} in class {ClassId}.",
            hold.Id, cleanStudentId, hold.ClassId);
    }

    public async Task<List<HoldResponseDto>> GetStudentHoldsAsync(
        string? studentIdHeader,
        CancellationToken cancellationToken = default)
    {
        var cleanStudentId = ValidateAndNormalizeStudentId(studentIdHeader);
        await ExpireOverdueHoldsAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var holds = await _dbContext.AdmissionHolds
            .Include(h => h.AdmissionClass)
            .AsNoTracking()
            .Where(h => h.StudentId == cleanStudentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(cancellationToken);

        return holds
            .Select(h => MapHoldToDto(h, h.AdmissionClass, now))
            .ToList();
    }

    public async Task<TimelineDto> GetTimelineAsync(CancellationToken cancellationToken = default)
    {
        var firstClass = await _dbContext.AdmissionClasses
            .AsNoTracking()
            .OrderBy(c => c.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (firstClass != null)
        {
            return new TimelineDto
            {
                StartDate = firstClass.AdmissionStartDate,
                EndDate = firstClass.AdmissionEndDate
            };
        }

        return new TimelineDto
        {
            StartDate = new DateTime(2026, 11, 1, 8, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 11, 30, 23, 59, 59, DateTimeKind.Utc)
        };
    }

    public async Task<TimelineDto> UpdateTimelineAsync(TimelineDto request, CancellationToken cancellationToken = default)
    {
        if (request == null || request.StartDate == default || request.EndDate == default)
        {
            throw new BadRequestDomainException("Valid start and end dates are required.");
        }

        var startUtc = request.StartDate.ToUniversalTime();
        var endUtc = request.EndDate.ToUniversalTime();

        if (endUtc <= startUtc)
        {
            throw new BadRequestDomainException("Admission closing date must be after the opening date.");
        }

        await _dbContext.AdmissionClasses
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(c => c.AdmissionStartDate, startUtc)
                .SetProperty(c => c.AdmissionEndDate, endUtc),
                cancellationToken);

        return new TimelineDto
        {
            StartDate = startUtc,
            EndDate = endUtc
        };
    }

    private static ClassResponseDto MapClassToDto(AdmissionClass cls, int heldSeats, int confirmedSeats)
    {
        int availableSeats = Math.Max(0, cls.TotalSeats - heldSeats - confirmedSeats);

        return new ClassResponseDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Grade = cls.Grade,
            Shift = cls.Shift,
            Group = cls.Group,
            Session = cls.AcademicSession,
            AcademicSession = cls.AcademicSession,
            TotalSeats = cls.TotalSeats,
            HeldSeats = heldSeats,
            ConfirmedSeats = confirmedSeats,
            AvailableSeats = availableSeats,
            Fee = cls.FeeAmount,
            FeeAmount = cls.FeeAmount,
            AdmissionStartDate = cls.AdmissionStartDate,
            AdmissionEndDate = cls.AdmissionEndDate,
            CreatedAt = cls.CreatedAt
        };
    }

    private static HoldResponseDto MapHoldToDto(AdmissionHold hold, AdmissionClass? cls, DateTime nowUtc)
    {
        int remainingSeconds = hold.Status == HoldStatus.Held
            ? Math.Max(0, (int)Math.Floor((hold.ExpiresAt - nowUtc).TotalSeconds))
            : 0;

        return new HoldResponseDto
        {
            HoldId = hold.Id,
            ApplicationCode = hold.ApplicationCode,
            ClassId = hold.ClassId,
            ClassName = cls?.Name ?? hold.ClassId,
            Grade = cls?.Grade ?? "Class 6",
            Shift = cls?.Shift ?? "Morning",
            Group = cls?.Group ?? "General",
            Session = cls?.AcademicSession ?? "Session 27",
            Fee = cls?.FeeAmount ?? 1500m,
            StudentId = hold.StudentId,
            Status = hold.Status,
            CreatedAt = hold.CreatedAt,
            ExpiresAt = hold.ExpiresAt,
            ConfirmedAt = hold.ConfirmedAt,
            CancelledAt = hold.CancelledAt,
            ExpiredAt = hold.ExpiredAt,
            RemainingSeconds = remainingSeconds
        };
    }

    private static string GenerateApplicationCode()
    {
        int randomSixDigits = Random.Shared.Next(100000, 999999);
        var suffix = Guid.NewGuid().ToString("N")[..3].ToUpperInvariant();
        return $"HUHS-2026-{randomSixDigits}{suffix}";
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException pgEx &&
               pgEx.SqlState == PostgresErrorCodes.UniqueViolation;
    }
}

