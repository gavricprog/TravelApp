namespace TravelApp.Api.Models;

public class ShareToken
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }
    public TravelPlan TravelPlan { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public ShareAccessType AccessType { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAtUtc { get; set; }
}
