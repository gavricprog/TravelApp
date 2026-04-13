using TravelApp.Api.DTOs;

namespace TravelApp.Api.FinanceModule.Services;

public interface IExpenseService
{
    Task<(bool ok, string? error, ExpenseDto? data)> AddAsync(int travelPlanId, int userId, CreateExpenseRequest request);
    Task<(bool ok, string? error)> DeleteAsync(int expenseId, int userId);
}
