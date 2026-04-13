using TravelApp.Api.Models;

namespace TravelApp.Api.TravelModule.Repositories;

/// <summary>Data access for travel plans and related entities (destinations, activities, checklist).</summary>
public interface ITravelRepository
{
    Task<List<TravelPlan>> ListForUserAsync(int userId);
    Task<TravelPlan?> GetOwnedAsync(int travelPlanId, int userId, bool asTracking = false);
    Task<TravelPlan?> GetOwnedWithDetailsAsync(int travelPlanId, int userId);
    Task<TravelPlan?> GetByShareTokenAsync(string shareToken);
    Task AddPlanAsync(TravelPlan plan);
    Task SaveChangesAsync();
    void RemovePlan(TravelPlan plan);

    Task<Destination?> GetDestinationAsync(int destinationId, int userId);
    void RemoveDestination(Destination d);

    Task<Activity?> GetActivityAsync(int activityId, int userId);
    void RemoveActivity(Activity a);

    Task<ChecklistItem?> GetChecklistItemAsync(int itemId, int userId);
    void RemoveChecklistItem(ChecklistItem item);

    Task<bool> UserOwnsTravelPlanAsync(int travelPlanId, int userId);
    Task<int> NextDestinationSortOrderAsync(int travelPlanId);
    Task AddDestinationAsync(Destination destination);
    Task AddActivityAsync(Activity activity);
    Task AddChecklistItemAsync(ChecklistItem item);
}
