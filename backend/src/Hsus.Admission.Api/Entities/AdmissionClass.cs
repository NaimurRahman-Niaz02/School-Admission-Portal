using System.ComponentModel.DataAnnotations;

namespace Hsus.Admission.Api.Entities;

public class AdmissionClass
{
    [Key]
    [MaxLength(64)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Grade { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Shift { get; set; } = "Morning";

    [Required]
    [MaxLength(50)]
    public string Group { get; set; } = "General";

    [Required]
    [MaxLength(50)]
    public string AcademicSession { get; set; } = "Session 27";

    public int TotalSeats { get; set; }

    public decimal FeeAmount { get; set; } = 1500m;

    public DateTime AdmissionStartDate { get; set; } = new DateTime(2026, 11, 1, 8, 0, 0, DateTimeKind.Utc);

    public DateTime AdmissionEndDate { get; set; } = new DateTime(2026, 11, 30, 23, 59, 59, DateTimeKind.Utc);

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AdmissionHold> Holds { get; set; } = new List<AdmissionHold>();
}

