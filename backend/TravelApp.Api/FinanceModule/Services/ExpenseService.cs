using TravelApp.Api.DTOs;
using TravelApp.Api.Models;
using TravelApp.Api.FinanceModule.Repositories;
using TravelApp.Api.TravelModule.Repositories;

namespace TravelApp.Api.FinanceModule.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenses;
    private readonly ITravelRepository _travel;

    public ExpenseService(IExpenseRepository expenses, ITravelRepository travel)
    {
        _expenses = expenses;
        _travel = travel;
    }

    private static string NormalizeCategory(string? category) =>
        string.IsNullOrWhiteSpace(category) ? "General" : category.Trim();

    private static ExpenseDto ToDto(Expense e) => new()
    {
        Id = e.Id,
        Amount = e.Amount,
        Description = e.Description,
        Category = e.Category,
        SpentOn = e.SpentOn
    };

    public async Task<(bool ok, string? error, ExpenseDto? data)> AddAsync(
        int travelPlanId, int userId, CreateExpenseRequest request)
    {
        if (!await _travel.UserOwnsTravelPlanAsync(travelPlanId, userId))
            return (false, "Travel plan not found.", null);

        var e = new Expense
        {
            TravelPlanId = travelPlanId,
            Amount = request.Amount,
            Description = request.Description.Trim(),
            Category = NormalizeCategory(request.Category),
            SpentOn = request.SpentOn
        };

        await _expenses.AddAsync(e);

        return (true, null, ToDto(e));
    }

    public async Task<(bool ok, string? error, ExpenseDto? data)> UpdateAsync(
        int expenseId, int userId, UpdateExpenseRequest request)
    {
        var e = await _expenses.GetOwnedAsync(expenseId, userId);
        if (e == null)
            return (false, "Expense not found.", null);

        e.Amount = request.Amount;
        e.Description = request.Description.Trim();
        e.Category = NormalizeCategory(request.Category);
        e.SpentOn = request.SpentOn;

        await _expenses.SaveChangesAsync();
        return (true, null, ToDto(e));
    }

    public async Task<(bool ok, string? error)> DeleteAsync(int expenseId, int userId)
    {
        var e = await _expenses.GetOwnedAsync(expenseId, userId);
        if (e == null)
            return (false, "Expense not found.");

        _expenses.Remove(e);
        await _expenses.SaveChangesAsync();
        return (true, null);
    }
}
