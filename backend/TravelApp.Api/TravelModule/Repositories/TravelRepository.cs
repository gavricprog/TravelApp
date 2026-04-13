using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Data;
using TravelApp.Api.Models;

namespace TravelApp.Api.TravelModule.Repositories;

public class TravelRepository : ITravelRepository
{
    private readonly ApplicationDbContext _db;

    public TravelRepository(ApplicationDbContext db) => _db = db;

    public async Task<List<TravelPlan>> ListForUserAsync(int userId) =>
        await _db.TravelPlans
            .AsNoTracking()
            .Include(t => t.Expenses)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.StartDate)
            .ToListAsync();

    public async Task<TravelPlan?> GetOwnedAsync(int travelPlanId, int userId, bool asTracking = false)
    {
        var q = _db.TravelPlans.Where(t => t.Id == travelPlanId && t.UserId == userId);
        return asTracking
            ? await q.FirstOrDefaultAsync()
            : await q.AsNoTracking().FirstOrDefaultAsync();
    }

    public async Task<TravelPlan?> GetOwnedWithDetailsAsync(int travelPlanId, int userId) =>
        await _db.TravelPlans
            .AsNoTracking()
            .Include(t => t.Destinations)
            .Include(t => t.Activities)
            .Include(t => t.Expenses)
            .Include(t => t.ChecklistItems)
            .Where(t => t.Id == travelPlanId && t.UserId == userId)
            .FirstOrDefaultAsync();

    public async Task<TravelPlan?> GetByShareTokenAsync(string shareToken) =>
        await _db.TravelPlans
            .AsNoTracking()
            .Include(t => t.Destinations)
            .Include(t => t.Activities)
            .Include(t => t.Expenses)
            .Include(t => t.ChecklistItems)
            .FirstOrDefaultAsync(t => t.ShareToken == shareToken);

    public async Task AddPlanAsync(TravelPlan plan)
    {
        _db.TravelPlans.Add(plan);
        await _db.SaveChangesAsync();
    }

    public Task SaveChangesAsync() => _db.SaveChangesAsync();

    public void RemovePlan(TravelPlan plan)
    {
        _db.TravelPlans.Remove(plan);
    }

    public async Task<Destination?> GetDestinationAsync(int destinationId, int userId) =>
        await _db.Destinations
            .Include(d => d.TravelPlan)
            .FirstOrDefaultAsync(d => d.Id == destinationId && d.TravelPlan.UserId == userId);

    public void RemoveDestination(Destination d) => _db.Destinations.Remove(d);

    public async Task<Activity?> GetActivityAsync(int activityId, int userId) =>
        await _db.Activities
            .Include(a => a.TravelPlan)
            .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlan.UserId == userId);

    public void RemoveActivity(Activity a) => _db.Activities.Remove(a);

    public async Task<ChecklistItem?> GetChecklistItemAsync(int itemId, int userId) =>
        await _db.ChecklistItems
            .Include(c => c.TravelPlan)
            .FirstOrDefaultAsync(c => c.Id == itemId && c.TravelPlan.UserId == userId);

    public void RemoveChecklistItem(ChecklistItem item) => _db.ChecklistItems.Remove(item);

    public Task<bool> UserOwnsTravelPlanAsync(int travelPlanId, int userId) =>
        _db.TravelPlans.AnyAsync(t => t.Id == travelPlanId && t.UserId == userId);

    public async Task<int> NextDestinationSortOrderAsync(int travelPlanId)
    {
        var max = await _db.Destinations
            .Where(d => d.TravelPlanId == travelPlanId)
            .Select(d => (int?)d.SortOrder)
            .MaxAsync();
        return (max ?? -1) + 1;
    }

    public async Task AddDestinationAsync(Destination destination)
    {
        _db.Destinations.Add(destination);
        await _db.SaveChangesAsync();
    }

    public async Task AddActivityAsync(Activity activity)
    {
        _db.Activities.Add(activity);
        await _db.SaveChangesAsync();
    }

    public async Task AddChecklistItemAsync(ChecklistItem item)
    {
        _db.ChecklistItems.Add(item);
        await _db.SaveChangesAsync();
    }
}
