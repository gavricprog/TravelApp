using TravelApp.Api.DTOs;

namespace TravelApp.Api.TravelModule.Services;

public interface ITravelPlanService
{
    Task<List<TravelPlanSummaryDto>> ListAsync(int userId);
    Task<TravelPlanDetailDto?> GetDetailAsync(int travelPlanId, int userId);
    Task<(bool ok, string? error, TravelPlanDetailDto? data)> CreateAsync(int userId, CreateTravelPlanRequest request);
    Task<(bool ok, string? error)> UpdateAsync(int travelPlanId, int userId, UpdateTravelPlanRequest request);
    Task<(bool ok, string? error)> DeleteAsync(int travelPlanId, int userId);

    Task<(bool ok, string? error, ShareLinkResponse? data)> RegenerateShareTokenAsync(int travelPlanId, int userId);
    Task<(bool ok, string? error, PlanShareResponse? data)> GetShareDetailsAsync(int travelPlanId, int userId, string baseUrl);
    Task<SharedTravelViewDto?> GetSharedViewAsync(string shareToken);

    Task<(bool ok, string? error, DestinationDto? data)> AddDestinationAsync(int travelPlanId, int userId, CreateDestinationRequest request);
    Task<(bool ok, string? error, DestinationDto? data)> UpdateDestinationAsync(int destinationId, int userId, UpdateDestinationRequest request);
    Task<(bool ok, string? error)> RemoveDestinationAsync(int destinationId, int userId);

    Task<(bool ok, string? error, ActivityDto? data)> AddActivityAsync(int travelPlanId, int userId, CreateActivityRequest request);
    Task<(bool ok, string? error, ActivityDto? data)> UpdateActivityAsync(int activityId, int userId, UpdateActivityRequest request);
    Task<(bool ok, string? error)> RemoveActivityAsync(int activityId, int userId);

    Task<(bool ok, string? error, ChecklistItemDto? data)> AddChecklistItemAsync(int travelPlanId, int userId, CreateChecklistItemRequest request);
    Task<(bool ok, string? error)> UpdateChecklistItemAsync(int itemId, int userId, UpdateChecklistItemRequest request);
    Task<(bool ok, string? error)> RemoveChecklistItemAsync(int itemId, int userId);
}
