using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelApp.Api.DTOs;
using TravelApp.Api.Infrastructure;
using TravelApp.Api.TravelModule.Services;

namespace TravelApp.Api.TravelModule.Controllers;

[ApiController]
[Route("api/travel-plans")]
[Authorize]
public class TravelPlansController : ControllerBase
{
    private readonly ITravelPlanService _travel;

    public TravelPlansController(ITravelPlanService travel) => _travel = travel;

    private int UserId => User.GetUserId();

    [HttpGet]
    public async Task<ActionResult<List<TravelPlanSummaryDto>>> List()
    {
        return Ok(await _travel.ListAsync(UserId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TravelPlanDetailDto>> Get(int id)
    {
        var dto = await _travel.GetDetailAsync(id, UserId);
        if (dto == null)
            return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<TravelPlanDetailDto>> Create([FromBody] CreateTravelPlanRequest request)
    {
        var (ok, error, data) = await _travel.CreateAsync(UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return CreatedAtAction(nameof(Get), new { id = data!.Id }, data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTravelPlanRequest request)
    {
        var (ok, error) = await _travel.UpdateAsync(id, UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (ok, error) = await _travel.DeleteAsync(id, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }

    /// <summary>Creates/replaces a random share token so others can open a read-only view.</summary>
    [HttpPost("{id:int}/share")]
    public async Task<ActionResult<ShareLinkResponse>> RegenerateShare(int id)
    {
        var (ok, error, data) = await _travel.RegenerateShareTokenAsync(id, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return Ok(data);
    }

    [HttpPost("{id:int}/destinations")]
    public async Task<ActionResult<DestinationDto>> AddDestination(int id, [FromBody] CreateDestinationRequest request)
    {
        var (ok, error, data) = await _travel.AddDestinationAsync(id, UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    [HttpPut("destinations/{destinationId:int}")]
    public async Task<ActionResult<DestinationDto>> UpdateDestination(int destinationId, [FromBody] UpdateDestinationRequest request)
    {
        var (ok, error, data) = await _travel.UpdateDestinationAsync(destinationId, UserId, request);
        if (!ok)
            return NotFound(new { message = error });
        return Ok(data);
    }

    [HttpDelete("destinations/{destinationId:int}")]
    public async Task<IActionResult> RemoveDestination(int destinationId)
    {
        var (ok, error) = await _travel.RemoveDestinationAsync(destinationId, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }

    [HttpPost("{id:int}/activities")]
    public async Task<ActionResult<ActivityDto>> AddActivity(int id, [FromBody] CreateActivityRequest request)
    {
        var (ok, error, data) = await _travel.AddActivityAsync(id, UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    [HttpPut("activities/{activityId:int}")]
    public async Task<ActionResult<ActivityDto>> UpdateActivity(int activityId, [FromBody] UpdateActivityRequest request)
    {
        var (ok, error, data) = await _travel.UpdateActivityAsync(activityId, UserId, request);
        if (!ok)
            return NotFound(new { message = error });
        return Ok(data);
    }

    [HttpDelete("activities/{activityId:int}")]
    public async Task<IActionResult> RemoveActivity(int activityId)
    {
        var (ok, error) = await _travel.RemoveActivityAsync(activityId, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }

    [HttpPost("{id:int}/checklist")]
    public async Task<ActionResult<ChecklistItemDto>> AddChecklistItem(int id, [FromBody] CreateChecklistItemRequest request)
    {
        var (ok, error, data) = await _travel.AddChecklistItemAsync(id, UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    [HttpPatch("checklist/{itemId:int}")]
    public async Task<IActionResult> UpdateChecklistItem(int itemId, [FromBody] UpdateChecklistItemRequest request)
    {
        var (ok, error) = await _travel.UpdateChecklistItemAsync(itemId, UserId, request);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }

    [HttpDelete("checklist/{itemId:int}")]
    public async Task<IActionResult> RemoveChecklistItem(int itemId)
    {
        var (ok, error) = await _travel.RemoveChecklistItemAsync(itemId, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }
}
