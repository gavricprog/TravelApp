namespace TravelApp.Api.Models;

/// <summary>Activity on a given day — name/title, optional time, place, estimated cost, status.</summary>
public class Activity
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;

    public DateTime DayDate { get; set; }

    /// <summary>Activity name (maps to "name" in specs).</summary>
    public string Title { get; set; } = string.Empty;

    public string? Notes { get; set; }

    /// <summary>Clock time as "HH:mm" (optional) — simple string for JSON + students.</summary>
    public string? Time { get; set; }

    public string? Location { get; set; }

    /// <summary>Optional estimated cost for this activity (separate from trip Expenses).</summary>
    public decimal? Cost { get; set; }

    public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
}
