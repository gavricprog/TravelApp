namespace TravelApp.Api.TravelModule.Services;

public interface ITravelPdfService
{
    Task<(bool ok, string? error, byte[]? content, string? fileName)> GeneratePlanPdfAsync(int travelPlanId, int userId);
}
