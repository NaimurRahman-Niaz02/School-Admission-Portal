using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hsus.Admission.Api.Controllers;

[ApiController]
[Route("holds")]
public class HoldsController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public HoldsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    /// <summary>
    /// Get application details by hold ID.
    /// GET /holds/{holdId}
    /// Requires X-Student-Id header for ownership validation.
    /// </summary>
    [HttpGet("{holdId}")]
    [ProducesResponseType(typeof(HoldResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HoldResponseDto>> GetHoldById(
        [FromRoute] string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var hold = await _admissionService.GetHoldByIdAsync(holdId, studentIdHeader, cancellationToken);
        return Ok(hold);
    }

    /// <summary>
    /// Confirm payment and finalize admission for an active seat hold.
    /// POST /holds/{holdId}/confirm
    /// Requires X-Student-Id header.
    /// </summary>
    [HttpPost("{holdId}/confirm")]
    [ProducesResponseType(typeof(HoldResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HoldResponseDto>> ConfirmHold(
        [FromRoute] string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var confirmed = await _admissionService.ConfirmHoldAsync(holdId, studentIdHeader, cancellationToken);
        return Ok(confirmed);
    }

    /// <summary>
    /// Cancel an active seat reservation hold and release the seat.
    /// DELETE /holds/{holdId}
    /// Requires X-Student-Id header.
    /// </summary>
    [HttpDelete("{holdId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelHold(
        [FromRoute] string holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        await _admissionService.CancelHoldAsync(holdId, studentIdHeader, cancellationToken);
        return NoContent();
    }
}

