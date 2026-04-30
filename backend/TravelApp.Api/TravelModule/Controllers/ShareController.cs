using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Data;
using TravelApp.Api.DTOs;
using TravelApp.Api.Infrastructure;
using TravelApp.Api.Models;
using TravelApp.Api.TravelModule.Services;

namespace TravelApp.Api.TravelModule.Controllers;

[ApiController]
[Route("api/share")]
public class ShareController : ControllerBase
{
    private readonly ITravelPlanService _travel;
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public ShareController(ITravelPlanService travel, ApplicationDbContext db, IConfiguration config)
    {
        _travel = travel;
        _db = db;
        _config = config;
    }

    private string FrontendBaseUrl =>
        string.IsNullOrWhiteSpace(_config["Frontend:BaseUrl"])
            ? "http://localhost:5173"
            : _config["Frontend:BaseUrl"]!;

    private async Task<(ShareToken? token, IActionResult? error)> GetShareTokenAsync(string rawToken, bool requireEdit)
    {
        var token = await _db.ShareTokens
            .Include(s => s.TravelPlan)
            .FirstOrDefaultAsync(s => s.Token == rawToken);

        if (token == null)
            return (null, Unauthorized(new { message = "Invalid share token." }));

        if (token.ExpiresAtUtc != null && token.ExpiresAtUtc <= DateTime.UtcNow)
            return (null, Unauthorized(new { message = "Share token expired." }));

        if (requireEdit && token.AccessType != ShareAccessType.Edit)
            return (null, StatusCode(StatusCodes.Status403Forbidden, new { message = "This share link is view-only." }));

        return (token, null);
    }

    private static bool ValidatePlanRules(DateTime start, DateTime end, decimal budget, out string? error)
    {
        if (end <= start)
        {
            error = "End date must be after start date.";
            return false;
        }

        if (budget < 0)
        {
            error = "Budget must be >= 0.";
            return false;
        }

        error = null;
        return true;
    }

    private static bool ValidateDestinationRules(DateTime start, DateTime end, out string? error)
    {
        if (start.Date > end.Date)
        {
            error = "Destination start date cannot be after end date.";
            return false;
        }

        error = null;
        return true;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PlanShareResponse>> CreateShare([FromBody] CreateShareRequest request)
    {
        var userId = User.GetUserId();
        var (ok, error, data) = await _travel.CreateShareAsync(request.PlanId, userId, request.AccessType, FrontendBaseUrl);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    /// <summary>Public shared trip view — no JWT required, only the secret token.</summary>
    [HttpGet("{token}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SharedTravelViewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SharedTravelViewDto>> GetShared(string token)
    {
        var view = await _travel.GetSharedViewAsync(token);
        if (view == null)
            return NotFound();
        return Ok(view);
    }

    [HttpPut("{token}/travel-plan")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateTravelPlan(string token, [FromBody] UpdateTravelPlanRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        if (!ValidatePlanRules(request.StartDate, request.EndDate, request.Budget, out var validationError))
            return BadRequest(new { message = validationError });

        var plan = await _db.TravelPlans.FindAsync(shareToken!.TravelPlanId);
        if (plan == null)
            return NotFound(new { message = "Travel plan not found." });

        plan.Title = request.Title.Trim();
        plan.StartDate = request.StartDate;
        plan.EndDate = request.EndDate;
        plan.Budget = request.Budget;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{token}/destinations")]
    [AllowAnonymous]
    public async Task<IActionResult> AddDestination(string token, [FromBody] CreateDestinationRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        if (!ValidateDestinationRules(request.StartDate, request.EndDate, out var validationError))
            return BadRequest(new { message = validationError });

        var sortOrder = await _db.Destinations
            .Where(d => d.TravelPlanId == shareToken!.TravelPlanId)
            .Select(d => (int?)d.SortOrder)
            .MaxAsync() ?? -1;

        var destination = new Destination
        {
            TravelPlanId = shareToken!.TravelPlanId,
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            StartDate = request.StartDate.Date,
            EndDate = request.EndDate.Date,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            SortOrder = sortOrder + 1
        };

        _db.Destinations.Add(destination);
        await _db.SaveChangesAsync();
        return Ok(new DestinationDto
        {
            Id = destination.Id,
            Name = destination.Name,
            Location = destination.Location,
            StartDate = destination.StartDate,
            EndDate = destination.EndDate,
            Description = destination.Description,
            Notes = destination.Notes,
            SortOrder = destination.SortOrder
        });
    }

    [HttpPut("{token}/destinations/{destinationId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateDestination(string token, int destinationId, [FromBody] UpdateDestinationRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var destination = await _db.Destinations.FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == shareToken!.TravelPlanId);
        if (destination == null)
            return NotFound(new { message = "Destination not found." });

        if (!ValidateDestinationRules(request.StartDate, request.EndDate, out var validationError))
            return BadRequest(new { message = validationError });

        destination.Name = request.Name.Trim();
        destination.Location = request.Location.Trim();
        destination.StartDate = request.StartDate.Date;
        destination.EndDate = request.EndDate.Date;
        destination.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        destination.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        await _db.SaveChangesAsync();

        return Ok(new DestinationDto
        {
            Id = destination.Id,
            Name = destination.Name,
            Location = destination.Location,
            StartDate = destination.StartDate,
            EndDate = destination.EndDate,
            Description = destination.Description,
            Notes = destination.Notes,
            SortOrder = destination.SortOrder
        });
    }

    [HttpDelete("{token}/destinations/{destinationId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteDestination(string token, int destinationId)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var destination = await _db.Destinations.FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlanId == shareToken!.TravelPlanId);
        if (destination == null)
            return NotFound(new { message = "Destination not found." });

        _db.Destinations.Remove(destination);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{token}/activities")]
    [AllowAnonymous]
    public async Task<IActionResult> AddActivity(string token, [FromBody] CreateActivityRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var activity = new Activity
        {
            TravelPlanId = shareToken!.TravelPlanId,
            DayDate = request.DayDate.Date,
            Title = request.Title.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Time = string.IsNullOrWhiteSpace(request.Time) ? null : request.Time.Trim(),
            Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
            Cost = request.Cost,
            Status = request.Status
        };

        _db.Activities.Add(activity);
        await _db.SaveChangesAsync();
        return Ok(ToActivityDto(activity));
    }

    [HttpPut("{token}/activities/{activityId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateActivity(string token, int activityId, [FromBody] UpdateActivityRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var activity = await _db.Activities.FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == shareToken!.TravelPlanId);
        if (activity == null)
            return NotFound(new { message = "Activity not found." });

        activity.DayDate = request.DayDate.Date;
        activity.Title = request.Title.Trim();
        activity.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        activity.Time = string.IsNullOrWhiteSpace(request.Time) ? null : request.Time.Trim();
        activity.Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim();
        activity.Cost = request.Cost;
        activity.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(ToActivityDto(activity));
    }

    [HttpDelete("{token}/activities/{activityId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteActivity(string token, int activityId)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var activity = await _db.Activities.FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == shareToken!.TravelPlanId);
        if (activity == null)
            return NotFound(new { message = "Activity not found." });

        _db.Activities.Remove(activity);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{token}/expenses")]
    [AllowAnonymous]
    public async Task<IActionResult> AddExpense(string token, [FromBody] CreateExpenseRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var expense = new Expense
        {
            TravelPlanId = shareToken!.TravelPlanId,
            Amount = request.Amount,
            Description = request.Description.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            SpentOn = request.SpentOn
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
        return Ok(new ExpenseDto
        {
            Id = expense.Id,
            Amount = expense.Amount,
            Description = expense.Description,
            Category = expense.Category,
            SpentOn = expense.SpentOn
        });
    }

    [HttpDelete("{token}/expenses/{expenseId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteExpense(string token, int expenseId)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == shareToken!.TravelPlanId);
        if (expense == null)
            return NotFound(new { message = "Expense not found." });

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{token}/checklist")]
    [AllowAnonymous]
    public async Task<IActionResult> AddChecklistItem(string token, [FromBody] CreateChecklistItemRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var item = new ChecklistItem
        {
            TravelPlanId = shareToken!.TravelPlanId,
            Text = request.Text.Trim(),
            IsDone = false
        };

        _db.ChecklistItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new ChecklistItemDto { Id = item.Id, Text = item.Text, IsDone = item.IsDone });
    }

    [HttpPatch("{token}/checklist/{itemId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateChecklistItem(string token, int itemId, [FromBody] UpdateChecklistItemRequest request)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var item = await _db.ChecklistItems.FirstOrDefaultAsync(c => c.Id == itemId && c.TravelPlanId == shareToken!.TravelPlanId);
        if (item == null)
            return NotFound(new { message = "Checklist item not found." });

        item.IsDone = request.IsDone;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{token}/checklist/{itemId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteChecklistItem(string token, int itemId)
    {
        var (shareToken, error) = await GetShareTokenAsync(token, requireEdit: true);
        if (error != null) return error;

        var item = await _db.ChecklistItems.FirstOrDefaultAsync(c => c.Id == itemId && c.TravelPlanId == shareToken!.TravelPlanId);
        if (item == null)
            return NotFound(new { message = "Checklist item not found." });

        _db.ChecklistItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ActivityDto ToActivityDto(Activity activity) => new()
    {
        Id = activity.Id,
        DayDate = activity.DayDate,
        Title = activity.Title,
        Notes = activity.Notes,
        Time = activity.Time,
        Location = activity.Location,
        Cost = activity.Cost,
        Status = activity.Status
    };
}
