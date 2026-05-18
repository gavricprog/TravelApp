namespace TravelApp.Api.Models;

public class ChecklistItem
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public DateTime? ReminderDate { get; set; }
    public string? Notes { get; set; }
    public bool IsDone { get; set; }
}
