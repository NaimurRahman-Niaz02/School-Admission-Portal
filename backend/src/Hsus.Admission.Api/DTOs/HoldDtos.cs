namespace Hsus.Admission.Api.DTOs;

public class CreateHoldRequest
{
    /// <summary>
    /// Optional body property for frontend compatibility; the X-Student-Id header is always authoritative.
    /// </summary>
    public string? StudentId { get; set; }
}

public class ConfirmHoldRequest
{
    /// <summary>
    /// Optional body property for frontend compatibility; the X-Student-Id header is always authoritative.
    /// </summary>
    public string? StudentId { get; set; }
}

public class HoldResponseDto
{
    public string HoldId { get; set; } = string.Empty;
    public string ApplicationCode { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Shift { get; set; } = "Morning";
    public string Group { get; set; } = "General";
    public string Session { get; set; } = "Session 27";
    public decimal Fee { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public int RemainingSeconds { get; set; }
}

