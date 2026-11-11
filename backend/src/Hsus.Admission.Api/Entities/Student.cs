using System.ComponentModel.DataAnnotations;

namespace Hsus.Admission.Api.Entities;

public class Student
{
    /// <summary>
    /// 17-digit Birth Registration Number stored strictly as a string.
    /// </summary>
    [Key]
    [MaxLength(17)]
    public string BirthRegistrationNumber { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AdmissionHold> Holds { get; set; } = new List<AdmissionHold>();
}

