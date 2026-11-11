using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hsus.Admission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public ClassesController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    /// <summary>
    /// Create a new admission class.
    /// POST /classes
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClassResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ClassResponseDto>> CreateClass(
        [FromBody] CreateClassRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _admissionService.CreateClassAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetClassById), new { classId = created.Id }, created);
    }

    /// <summary>
    /// Get all admission classes with live seat statistics.
    /// GET /classes
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ClassResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ClassResponseDto>>> GetClasses(CancellationToken cancellationToken)
    {
        var classes = await _admissionService.GetClassesAsync(cancellationToken);
        return Ok(classes);
    }

    /// <summary>
    /// Get details and current seat statistics for a specific admission class.
    /// GET /classes/{classId}
    /// </summary>
    [HttpGet("{classId}")]
    [ProducesResponseType(typeof(ClassResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClassResponseDto>> GetClassById(
        [FromRoute] string classId,
        CancellationToken cancellationToken)
    {
        var cls = await _admissionService.GetClassByIdAsync(classId, cancellationToken);
        return Ok(cls);
    }

    /// <summary>
    /// Reserve a temporary seat hold in the specified class.
    /// POST /classes/{classId}/holds
    /// Requires X-Student-Id header (17-digit birth registration number).
    /// </summary>
    [HttpPost("{classId}/holds")]
    [ProducesResponseType(typeof(HoldResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HoldResponseDto>> CreateHold(
        [FromRoute] string classId,
        [FromHeader(Name = "X-Student-Id")] string? studentIdHeader,
        CancellationToken cancellationToken)
    {
        var hold = await _admissionService.CreateHoldAsync(classId, studentIdHeader, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, hold);
    }
}

