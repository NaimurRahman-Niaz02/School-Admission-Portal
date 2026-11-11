using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hsus.Admission.Api.Entities;

public class AdmissionHold
{
    [Key]
    [MaxLength(64)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(32)]
    public string ApplicationCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(64)]
    public string ClassId { get; set; } = string.Empty;

    [ForeignKey(nameof(ClassId))]
    public AdmissionClass? AdmissionClass { get; set; }

    [Required]
    [MaxLength(17)]
    public string StudentId { get; set; } = string.Empty;

    [ForeignKey(nameof(StudentId))]
    public Student? Student { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = HoldStatus.Held;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public DateTime? ExpiredAt { get; set; }
}

