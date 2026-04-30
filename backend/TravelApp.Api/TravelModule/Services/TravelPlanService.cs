using System.Security.Cryptography;
using TravelApp.Api.DTOs;
using TravelApp.Api.Models;
using TravelApp.Api.TravelModule.Repositories;

namespace TravelApp.Api.TravelModule.Services;

/// <summary>
/// TravelService boundary for plans, destinations, activities, checklist, sharing, and reports.
/// This service is designed to be deployed as a separate Service Fabric service.
/// </summary>
public class TravelPlanService : ITravelPlanService
{
    private readonly ITravelRepository _travel;
    private readonly IQrCodeService _qrCode;

    public TravelPlanService(ITravelRepository travel, IQrCodeService qrCode)
    {
        _travel = travel;
        _qrCode = qrCode;
    }

    /// <summary>Professor-facing rules: end after start, budget non-negative.</summary>
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

    private static decimal SumCommittedCosts(IEnumerable<Expense> expenses, IEnumerable<Activity> activities) =>
        expenses.Sum(e => e.Amount) +
        activities
            .Where(a => a.Status == ActivityStatus.Done)
            .Sum(a => a.Cost ?? 0);

    private static bool ValidateDestinationRules(
        string name,
        string location,
        DateTime startDate,
        DateTime endDate,
        out string? error)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            error = "Destination name is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(location))
        {
            error = "Destination location is required.";
            return false;
        }

        if (startDate.Date > endDate.Date)
        {
            error = "Destination start date cannot be after end date.";
            return false;
        }

        error = null;
        return true;
    }

    private static ActivityDto ToActivityDto(Activity a) => new()
    {
        Id = a.Id,
        DayDate = a.DayDate,
        Title = a.Title,
        Notes = a.Notes,
        Time = a.Time,
        Location = a.Location,
        Cost = a.Cost,
        Status = a.Status
    };

    private static TravelPlanSummaryDto ToSummary(TravelPlan p)
    {
        var total = SumCommittedCosts(p.Expenses, p.Activities);
        return new TravelPlanSummaryDto
        {
            Id = p.Id,
            Title = p.Title,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Budget = p.Budget,
            TotalExpenses = total,
            ShareToken = p.ShareToken
        };
    }

    private static TravelPlanDetailDto ToDetail(TravelPlan p)
    {
        var summary = ToSummary(p);
        return new TravelPlanDetailDto
        {
            Id = summary.Id,
            Title = summary.Title,
            StartDate = summary.StartDate,
            EndDate = summary.EndDate,
            Budget = summary.Budget,
            TotalExpenses = summary.TotalExpenses,
            ShareToken = summary.ShareToken,
            Destinations = p.Destinations
                .OrderBy(d => d.SortOrder)
                .Select(d => new DestinationDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Location = d.Location,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    Description = d.Description,
                    Notes = d.Notes,
                    SortOrder = d.SortOrder
                })
                .ToList(),
            Activities = p.Activities
                .OrderBy(a => a.DayDate)
                .ThenBy(a => a.Id)
                .Select(a => ToActivityDto(a))
                .ToList(),
            Expenses = p.Expenses
                .OrderByDescending(e => e.Id)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Amount = e.Amount,
                    Description = e.Description,
                    Category = e.Category,
                    SpentOn = e.SpentOn
                })
                .ToList(),
            Checklist = p.ChecklistItems
                .OrderBy(c => c.Id)
                .Select(c => new ChecklistItemDto { Id = c.Id, Text = c.Text, IsDone = c.IsDone })
                .ToList()
        };
    }

    public async Task<List<TravelPlanSummaryDto>> ListAsync(int userId)
    {
        var plans = await _travel.ListForUserAsync(userId);
        return plans.Select(ToSummary).ToList();
    }

    public async Task<TravelPlanDetailDto?> GetDetailAsync(int travelPlanId, int userId)
    {
        var p = await _travel.GetOwnedWithDetailsAsync(travelPlanId, userId);
        return p == null ? null : ToDetail(p);
    }

    public async Task<(bool ok, string? error, TravelPlanDetailDto? data)> CreateAsync(int userId, CreateTravelPlanRequest request)
    {
        if (!ValidatePlanRules(request.StartDate, request.EndDate, request.Budget, out var err))
            return (false, err, null);

        var plan = new TravelPlan
        {
            UserId = userId,
            Title = request.Title.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Budget = request.Budget
        };

        await _travel.AddPlanAsync(plan);
        var full = await _travel.GetOwnedWithDetailsAsync(plan.Id, userId);
        return (true, null, full == null ? null : ToDetail(full));
    }

    public async Task<(bool ok, string? error)> UpdateAsync(int travelPlanId, int userId, UpdateTravelPlanRequest request)
    {
        if (!ValidatePlanRules(request.StartDate, request.EndDate, request.Budget, out var err))
            return (false, err);

        var plan = await _travel.GetOwnedAsync(travelPlanId, userId, asTracking: true);
        if (plan == null)
            return (false, "Travel plan not found.");

        plan.Title = request.Title.Trim();
        plan.StartDate = request.StartDate;
        plan.EndDate = request.EndDate;
        plan.Budget = request.Budget;

        await _travel.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool ok, string? error)> DeleteAsync(int travelPlanId, int userId)
    {
        var plan = await _travel.GetOwnedAsync(travelPlanId, userId, asTracking: true);
        if (plan == null)
            return (false, "Travel plan not found.");

        _travel.RemovePlan(plan);
        await _travel.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool ok, string? error, ShareLinkResponse? data)> RegenerateShareTokenAsync(int travelPlanId, int userId)
    {
        var plan = await _travel.GetOwnedAsync(travelPlanId, userId, asTracking: true);
        if (plan == null)
            return (false, "Travel plan not found.", null);

        // Simple random token — long enough to guess impractical for a class project.
        plan.ShareToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        await _travel.SaveChangesAsync();

        return (true, null, new ShareLinkResponse { ShareToken = plan.ShareToken });
    }

    public async Task<(bool ok, string? error, PlanShareResponse? data)> GetShareDetailsAsync(
        int travelPlanId,
        int userId,
        string baseUrl)
    {
        var plan = await _travel.GetOwnedAsync(travelPlanId, userId, asTracking: true);
        if (plan == null)
            return (false, "Travel plan not found.", null);

        if (string.IsNullOrWhiteSpace(plan.ShareToken))
        {
            plan.ShareToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
            await _travel.SaveChangesAsync();
        }

        var shareUrl = $"{baseUrl.TrimEnd('/')}/share/{plan.ShareToken}";
        var qrCode = _qrCode.GeneratePngDataUrl(shareUrl);

        return (true, null, new PlanShareResponse
        {
            ShareUrl = shareUrl,
            QrCode = qrCode,
            AccessLevel = "VIEW"
        });
    }

    public async Task<(bool ok, string? error, PlanShareResponse? data)> CreateShareAsync(
        int travelPlanId,
        int userId,
        string accessType,
        string baseUrl)
    {
        var plan = await _travel.GetOwnedAsync(travelPlanId, userId, asTracking: false);
        if (plan == null)
            return (false, "Travel plan not found.", null);

        if (!Enum.TryParse<ShareAccessType>(accessType, ignoreCase: true, out var parsedAccess))
            return (false, "Access type must be VIEW or EDIT.", null);

        var token = new ShareToken
        {
            TravelPlanId = travelPlanId,
            Token = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)),
            AccessType = parsedAccess,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _travel.AddShareTokenAsync(token);

        var shareUrl = $"{baseUrl.TrimEnd('/')}/share/{token.Token}";
        return (true, null, new PlanShareResponse
        {
            ShareUrl = shareUrl,
            QrCode = _qrCode.GeneratePngDataUrl(shareUrl),
            AccessLevel = parsedAccess == ShareAccessType.Edit ? "EDIT" : "VIEW",
            ExpiresAtUtc = token.ExpiresAtUtc
        });
    }

    public async Task<SharedTravelViewDto?> GetSharedViewAsync(string shareToken)
    {
        if (string.IsNullOrWhiteSpace(shareToken))
            return null;

        var token = await _travel.GetShareTokenAsync(shareToken.Trim());
        var p = token?.TravelPlan;
        var accessLevel = token?.AccessType == ShareAccessType.Edit ? "EDIT" : "VIEW";

        if (p == null)
        {
            p = await _travel.GetByShareTokenAsync(shareToken.Trim());
            accessLevel = "VIEW";
        }

        if (p == null)
            return null;

        var total = SumCommittedCosts(p.Expenses, p.Activities);
        var activitiesByDay = p.Activities
            .GroupBy(a => a.DayDate.Date)
            .OrderBy(g => g.Key)
            .Select(g => new ActivitiesByDayDto
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Items = g.OrderBy(a => a.Id).Select(a => ToActivityDto(a)).ToList()
            })
            .ToList();

        return new SharedTravelViewDto
        {
            Id = p.Id,
            Title = p.Title,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Budget = p.Budget,
            TotalExpenses = total,
            RemainingBudget = p.Budget - total,
            AccessLevel = accessLevel,
            Destinations = p.Destinations
                .OrderBy(d => d.SortOrder)
                .Select(d => new DestinationDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Location = d.Location,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    Description = d.Description,
                    Notes = d.Notes,
                    SortOrder = d.SortOrder
                })
                .ToList(),
            ActivitiesByDay = activitiesByDay,
            Expenses = p.Expenses
                .OrderByDescending(e => e.Id)
                .Select(e => new ExpenseDto
                {
                    Id = e.Id,
                    Amount = e.Amount,
                    Description = e.Description,
                    Category = e.Category,
                    SpentOn = e.SpentOn
                })
                .ToList(),
            Checklist = p.ChecklistItems
                .OrderBy(c => c.Id)
                .Select(c => new ChecklistItemDto { Id = c.Id, Text = c.Text, IsDone = c.IsDone })
                .ToList()
        };
    }

    public async Task<(bool ok, string? error, DestinationDto? data)> AddDestinationAsync(
        int travelPlanId, int userId, CreateDestinationRequest request)
    {
        if (!await _travel.UserOwnsTravelPlanAsync(travelPlanId, userId))
            return (false, "Travel plan not found.", null);

        if (!ValidateDestinationRules(request.Name, request.Location, request.StartDate, request.EndDate, out var err))
            return (false, err, null);

        var order = await _travel.NextDestinationSortOrderAsync(travelPlanId);
        var d = new Destination
        {
            TravelPlanId = travelPlanId,
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
            StartDate = request.StartDate.Date,
            EndDate = request.EndDate.Date,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            SortOrder = order
        };

        await _travel.AddDestinationAsync(d);

        return (true, null, new DestinationDto
        {
            Id = d.Id,
            Name = d.Name,
            Location = d.Location,
            StartDate = d.StartDate,
            EndDate = d.EndDate,
            Description = d.Description,
            Notes = d.Notes,
            SortOrder = d.SortOrder
        });
    }

    public async Task<(bool ok, string? error, DestinationDto? data)> UpdateDestinationAsync(
        int destinationId, int userId, UpdateDestinationRequest request)
    {
        var d = await _travel.GetDestinationAsync(destinationId, userId);
        if (d == null)
            return (false, "Destination not found.", null);

        if (!ValidateDestinationRules(request.Name, request.Location, request.StartDate, request.EndDate, out var err))
            return (false, err, null);

        d.Name = request.Name.Trim();
        d.Location = request.Location.Trim();
        d.StartDate = request.StartDate.Date;
        d.EndDate = request.EndDate.Date;
        d.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        d.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        await _travel.SaveChangesAsync();
        return (true, null, new DestinationDto
        {
            Id = d.Id,
            Name = d.Name,
            Location = d.Location,
            StartDate = d.StartDate,
            EndDate = d.EndDate,
            Description = d.Description,
            Notes = d.Notes,
            SortOrder = d.SortOrder
        });
    }

    public async Task<(bool ok, string? error)> RemoveDestinationAsync(int destinationId, int userId)
    {
        var d = await _travel.GetDestinationAsync(destinationId, userId);
        if (d == null)
            return (false, "Destination not found.");

        _travel.RemoveDestination(d);
        await _travel.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool ok, string? error, ActivityDto? data)> AddActivityAsync(
        int travelPlanId, int userId, CreateActivityRequest request)
    {
        if (!await _travel.UserOwnsTravelPlanAsync(travelPlanId, userId))
            return (false, "Travel plan not found.", null);

        var a = new Activity
        {
            TravelPlanId = travelPlanId,
            DayDate = request.DayDate.Date,
            Title = request.Title.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Time = string.IsNullOrWhiteSpace(request.Time) ? null : request.Time.Trim(),
            Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
            Cost = request.Cost,
            Status = request.Status
        };

        await _travel.AddActivityAsync(a);

        return (true, null, ToActivityDto(a));
    }

    public async Task<(bool ok, string? error, ActivityDto? data)> UpdateActivityAsync(
        int activityId, int userId, UpdateActivityRequest request)
    {
        var a = await _travel.GetActivityAsync(activityId, userId);
        if (a == null)
            return (false, "Activity not found.", null);

        a.DayDate = request.DayDate.Date;
        a.Title = request.Title.Trim();
        a.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        a.Time = string.IsNullOrWhiteSpace(request.Time) ? null : request.Time.Trim();
        a.Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim();
        a.Cost = request.Cost;
        a.Status = request.Status;

        await _travel.SaveChangesAsync();
        return (true, null, ToActivityDto(a));
    }

    public async Task<(bool ok, string? error)> RemoveActivityAsync(int activityId, int userId)
    {
        var a = await _travel.GetActivityAsync(activityId, userId);
        if (a == null)
            return (false, "Activity not found.");

        _travel.RemoveActivity(a);
        await _travel.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool ok, string? error, ChecklistItemDto? data)> AddChecklistItemAsync(
        int travelPlanId, int userId, CreateChecklistItemRequest request)
    {
        if (!await _travel.UserOwnsTravelPlanAsync(travelPlanId, userId))
            return (false, "Travel plan not found.", null);

        var c = new ChecklistItem
        {
            TravelPlanId = travelPlanId,
            Text = request.Text.Trim(),
            IsDone = false
        };

        await _travel.AddChecklistItemAsync(c);

        return (true, null, new ChecklistItemDto { Id = c.Id, Text = c.Text, IsDone = c.IsDone });
    }

    public async Task<(bool ok, string? error)> UpdateChecklistItemAsync(int itemId, int userId, UpdateChecklistItemRequest request)
    {
        var item = await _travel.GetChecklistItemAsync(itemId, userId);
        if (item == null)
            return (false, "Checklist item not found.");

        item.IsDone = request.IsDone;
        await _travel.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool ok, string? error)> RemoveChecklistItemAsync(int itemId, int userId)
    {
        var item = await _travel.GetChecklistItemAsync(itemId, userId);
        if (item == null)
            return (false, "Checklist item not found.");

        _travel.RemoveChecklistItem(item);
        await _travel.SaveChangesAsync();
        return (true, null);
    }
}
