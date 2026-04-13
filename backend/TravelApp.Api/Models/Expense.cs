namespace TravelApp.Api.Models;

public class Expense
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;

    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;

    /// <summary>e.g. Food, Transport — simple string category.</summary>
    public string Category { get; set; } = "General";

    public DateTime? SpentOn { get; set; }
}
