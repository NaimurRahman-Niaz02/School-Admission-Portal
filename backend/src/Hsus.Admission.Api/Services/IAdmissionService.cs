using Hsus.Admission.Api.DTOs;

namespace Hsus.Admission.Api.Services;

public interface IAdmissionService
{
    Task<int> ExpireOverdueHoldsAsync(CancellationToken cancellationToken = default);
    Task<ClassResponseDto> CreateClassAsync(CreateClassRequest request, CancellationToken cancellationToken = default);
    Task<List<ClassResponseDto>> GetClassesAsync(CancellationToken cancellationToken = default);
    Task<ClassResponseDto> GetClassByIdAsync(string classId, CancellationToken cancellationToken = default);
    Task<HoldResponseDto> CreateHoldAsync(string classId, string? studentIdHeader, CancellationToken cancellationToken = default);
    Task<HoldResponseDto> GetHoldByIdAsync(string holdId, string? studentIdHeader, CancellationToken cancellationToken = default);
    Task<HoldResponseDto> ConfirmHoldAsync(string holdId, string? studentIdHeader, CancellationToken cancellationToken = default);
    Task CancelHoldAsync(string holdId, string? studentIdHeader, CancellationToken cancellationToken = default);
    Task<List<HoldResponseDto>> GetStudentHoldsAsync(string? studentIdHeader, CancellationToken cancellationToken = default);
    Task<TimelineDto> GetTimelineAsync(CancellationToken cancellationToken = default);
    Task<TimelineDto> UpdateTimelineAsync(TimelineDto request, CancellationToken cancellationToken = default);
}

