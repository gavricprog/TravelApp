using System.ComponentModel.DataAnnotations;
using TravelApp.Api.Models;

namespace TravelApp.Api.DTOs;

public class TravelPlanSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Budget { get; set; }
    public decimal TotalExpenses { get; set; }
    public string? ShareToken { get; set; }
}

public class TravelPlanDetailDto : TravelPlanSummaryDto
{
    public List<DestinationDto> Destinations { get; set; } = new();
    public List<ActivityDto> Activities { get; set; } = new();
    public List<ExpenseDto> Expenses { get; set; } = new();
    public List<ChecklistItemDto> Checklist { get; set; } = new();
}

public class CreateTravelPlanRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budget must be >= 0")]
    public decimal Budget { get; set; }
}

public class UpdateTravelPlanRequest : CreateTravelPlanRequest
{
}

public class DestinationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }
}

public class CreateDestinationRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }
}

public class UpdateDestinationRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }
}

public class ActivityDto
{
    public int Id { get; set; }
    public DateTime DayDate { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Time { get; set; }
    public string? Location { get; set; }
    public decimal? Cost { get; set; }
    public ActivityStatus Status { get; set; }
}

public class CreateActivityRequest
{
    public DateTime DayDate { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MaxLength(10)]
    public string? Time { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Cost { get; set; }

    public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
}

public class UpdateActivityRequest
{
    public DateTime DayDate { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MaxLength(10)]
    public string? Time { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Cost { get; set; }

    public ActivityStatus Status { get; set; }
}

public class ActivitiesByDayDto
{
    public string Date { get; set; } = string.Empty;
    public List<ActivityDto> Items { get; set; } = new();
}

/// <summary>Read-only bundle for shared link (no edit IDs needed for mutations).</summary>
public class SharedTravelViewDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Budget { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal RemainingBudget { get; set; }
    public List<DestinationDto> Destinations { get; set; } = new();
    public List<ActivitiesByDayDto> ActivitiesByDay { get; set; } = new();
    public List<ExpenseDto> Expenses { get; set; } = new();
    public List<ChecklistItemDto> Checklist { get; set; } = new();
}

public class ShareLinkResponse
{
    public string ShareToken { get; set; } = string.Empty;
}
