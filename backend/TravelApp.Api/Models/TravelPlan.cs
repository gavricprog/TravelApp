namespace TravelApp.Api.Models;

public class TravelPlan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>Trip budget — must be &gt;= 0 (validated in service layer).</summary>
    public decimal Budget { get; set; }

    /// <summary>Legacy view token kept for older database rows; new sharing uses ShareTokens.</summary>
    public string? ShareToken { get; set; }

    public ICollection<Destination> Destinations { get; set; } = new List<Destination>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
    public ICollection<ShareToken> ShareTokens { get; set; } = new List<ShareToken>();
}
