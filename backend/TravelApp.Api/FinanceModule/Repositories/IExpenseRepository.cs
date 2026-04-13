using TravelApp.Api.Models;

namespace TravelApp.Api.FinanceModule.Repositories;

public interface IExpenseRepository
{
    Task<Expense?> GetOwnedAsync(int expenseId, int userId);
    Task AddAsync(Expense expense);
    Task SaveChangesAsync();
    void Remove(Expense expense);
}
