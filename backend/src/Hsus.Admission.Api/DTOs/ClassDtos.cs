namespace Hsus.Admission.Api.DTOs;

public class CreateClassRequest
{
    public string? Name { get; set; }
    public int TotalSeats { get; set; }
    public string? Grade { get; set; }
    public string? Shift { get; set; }
    public string? Group { get; set; }
    public string? Session { get; set; }
    public string? AcademicSession { get; set; }
    public decimal? Fee { get; set; }
    public decimal? FeeAmount { get; set; }
    public DateTime? AdmissionStartDate { get; set; }
    public DateTime? AdmissionEndDate { get; set; }
}

public class ClassResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Shift { get; set; } = "Morning";
    public string Group { get; set; } = "General";
    public string Session { get; set; } = "Session 27";
    public string AcademicSession { get; set; } = "Session 27";
    public int TotalSeats { get; set; }
    public int HeldSeats { get; set; }
    public int ConfirmedSeats { get; set; }
    public int AvailableSeats { get; set; }
    public decimal Fee { get; set; }
    public decimal FeeAmount { get; set; }
    public DateTime AdmissionStartDate { get; set; }
    public DateTime AdmissionEndDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

