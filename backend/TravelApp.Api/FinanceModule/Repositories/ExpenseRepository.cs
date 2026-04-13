using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Data;
using TravelApp.Api.Models;

namespace TravelApp.Api.FinanceModule.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ApplicationDbContext _db;

    public ExpenseRepository(ApplicationDbContext db) => _db = db;

    public Task<Expense?> GetOwnedAsync(int expenseId, int userId) =>
        _db.Expenses
            .Include(e => e.TravelPlan)
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlan.UserId == userId);

    public async Task AddAsync(Expense expense)
    {
        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
    }

    public Task SaveChangesAsync() => _db.SaveChangesAsync();

    public void Remove(Expense expense) => _db.Expenses.Remove(expense);
}
