using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hsus.Admission.Api.Controllers;

[ApiController]
[Route("me/holds")]
public class StudentHoldsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public StudentHoldsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    /// <summary>
    /// Get all applications belonging to the student identified by X-Student-Id header,
    /// including active, confirmed, expired, and cancelled historical records.
    /// GET /me/holds
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<HoldResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<HoldResponseDto>>> GetMyHolds(
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var holds = await _admissionService.GetStudentHoldsAsync(studentIdHeader, cancellationToken);
        return Ok(holds);
    }
}

