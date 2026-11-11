using Hsus.Admission.Api.DTOs;
using Hsus.Admission.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hsus.Admission.Api.Controllers;

[ApiController]
[Route("timeline")]
public class TimelineController : ControllerBase
{
    private readonly IAdmissionService _admissionService;

    public TimelineController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(TimelineDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TimelineDto>> GetTimeline(CancellationToken cancellationToken)
    {
        var timeline = await _admissionService.GetTimelineAsync(cancellationToken);
        return Ok(timeline);
    }

    [HttpPut]
    [ProducesResponseType(typeof(TimelineDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TimelineDto>> UpdateTimeline(
        [FromBody] TimelineDto request,
        CancellationToken cancellationToken)
    {
        var updated = await _admissionService.UpdateTimelineAsync(request, cancellationToken);
        return Ok(updated);
    }
}

