using Hsus.Admission.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hsus.Admission.Api.Data;

public class AdmissionDbContext : DbContext
{
    public AdmissionDbContext(DbContextOptions<AdmissionDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<AdmissionClass> AdmissionClasses => Set<AdmissionClass>();
    public DbSet<AdmissionHold> AdmissionHolds => Set<AdmissionHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Students Table
        modelBuilder.Entity<Student>(entity =>
        {
            entity.ToTable("students", t =>
            {
                t.HasCheckConstraint(
                    "CK_Students_BirthRegistrationNumber_17Digits",
                    "\"BirthRegistrationNumber\" ~ '^[0-9]{17}$'");
            });

            entity.HasKey(s => s.BirthRegistrationNumber);

            entity.Property(s => s.BirthRegistrationNumber)
                .HasMaxLength(17)
                .IsRequired();

            entity.Property(s => s.CreatedAt)
                .IsRequired();
        });

        // 2. AdmissionClasses Table
        modelBuilder.Entity<AdmissionClass>(entity =>
        {
            entity.ToTable("admission_classes", t =>
            {
                t.HasCheckConstraint("CK_AdmissionClasses_TotalSeats_Positive", "\"TotalSeats\" > 0");
                t.HasCheckConstraint("CK_AdmissionClasses_FeeAmount_NonNegative", "\"FeeAmount\" >= 0");
            });

            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                .HasMaxLength(64)
                .IsRequired();

            entity.Property(c => c.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(c => c.Grade)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(c => c.Shift)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(c => c.Group)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(c => c.AcademicSession)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(c => c.TotalSeats)
                .IsRequired();

            entity.Property(c => c.FeeAmount)
                .HasPrecision(10, 2)
                .IsRequired();

            entity.Property(c => c.AdmissionStartDate)
                .IsRequired();

            entity.Property(c => c.AdmissionEndDate)
                .IsRequired();

            entity.Property(c => c.CreatedAt)
                .IsRequired();

            entity.HasIndex(c => new { c.Name, c.AcademicSession })
                .IsUnique()
                .HasDatabaseName("IX_AdmissionClasses_Name_AcademicSession");

            entity.HasIndex(c => new { c.Grade, c.Shift, c.Group, c.AcademicSession })
                .IsUnique()
                .HasDatabaseName("IX_AdmissionClasses_Grade_Shift_Group_AcademicSession");
        });

        // 3. AdmissionHolds Table
        modelBuilder.Entity<AdmissionHold>(entity =>
        {
            entity.ToTable("admission_holds", t =>
            {
                t.HasCheckConstraint(
                    "CK_AdmissionHolds_Status",
                    "\"Status\" IN ('HELD', 'CONFIRMED', 'EXPIRED', 'CANCELLED')");
            });

            entity.HasKey(h => h.Id);

            entity.Property(h => h.Id)
                .HasMaxLength(64)
                .IsRequired();

            entity.Property(h => h.ApplicationCode)
                .HasMaxLength(32)
                .IsRequired();

            entity.Property(h => h.ClassId)
                .HasMaxLength(64)
                .IsRequired();

            entity.Property(h => h.StudentId)
                .HasMaxLength(17)
                .IsRequired();

            entity.Property(h => h.Status)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(h => h.CreatedAt)
                .IsRequired();

            entity.Property(h => h.ExpiresAt)
                .IsRequired();

            entity.HasIndex(h => h.ApplicationCode)
                .IsUnique()
                .HasDatabaseName("IX_AdmissionHolds_ApplicationCode");

            entity.HasIndex(h => new { h.ClassId, h.Status, h.ExpiresAt })
                .HasDatabaseName("IX_AdmissionHolds_ClassId_Status_ExpiresAt");

            entity.HasIndex(h => new { h.Status, h.ExpiresAt })
                .HasDatabaseName("IX_AdmissionHolds_Status_ExpiresAt");

            // Database-level protection for global single-admission rule:
            // A student can have at most ONE row in HELD or CONFIRMED status across the entire school.
            entity.HasIndex(h => h.StudentId)
                .IsUnique()
                .HasDatabaseName("IX_AdmissionHolds_StudentId_ActiveOrConfirmed")
                .HasFilter("\"Status\" IN ('HELD', 'CONFIRMED')");

            entity.HasOne(h => h.AdmissionClass)
                .WithMany(c => c.Holds)
                .HasForeignKey(h => h.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(h => h.Student)
                .WithMany(s => s.Holds)
                .HasForeignKey(h => h.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

