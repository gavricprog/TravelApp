using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelApp.Api.DTOs;
using TravelApp.Api.TravelModule.Services;

namespace TravelApp.Api.TravelModule.Controllers;

[ApiController]
[Route("api/share")]
[AllowAnonymous]
public class ShareController : ControllerBase
{
    private readonly ITravelPlanService _travel;

    public ShareController(ITravelPlanService travel) => _travel = travel;

    /// <summary>Public read-only trip view — no JWT required, only the secret token.</summary>
    [HttpGet("{token}")]
    [ProducesResponseType(typeof(SharedTravelViewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SharedTravelViewDto>> GetShared(string token)
    {
        var view = await _travel.GetSharedViewAsync(token);
        if (view == null)
            return NotFound();
        return Ok(view);
    }
}
