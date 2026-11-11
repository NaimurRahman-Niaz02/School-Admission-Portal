namespace Hsus.Admission.Api.Configuration;

public class AdmissionOptions
{
    public const string SectionName = "Admission";

    /// <summary>
    /// Configurable hold duration in seconds (env var: HOLD_DURATION_SECONDS). Defaults to 600s (10 minutes).
    /// </summary>
    public int HoldDurationSeconds { get; set; } = 600;

    /// <summary>
    /// Interval in seconds for the background expiration worker to scan and expire holds.
    /// </summary>
    public int ExpirationCheckIntervalSeconds { get; set; } = 1;

    /// <summary>
    /// Whether to idempotently seed demo admission classes if the database has no classes.
    /// </summary>
    public bool SeedDemoData { get; set; } = true;
}

