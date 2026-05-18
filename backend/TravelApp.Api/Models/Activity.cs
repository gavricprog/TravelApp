namespace TravelApp.Api.Models;

public class Activity
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;

    public DateTime DayDate { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public string? Time { get; set; }

    public string? Location { get; set; }

    public decimal? Cost { get; set; }

    public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
}
