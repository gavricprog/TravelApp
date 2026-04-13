using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelApp.Api.DTOs;
using TravelApp.Api.FinanceModule.Services;
using TravelApp.Api.Infrastructure;

namespace TravelApp.Api.FinanceModule.Controllers;

[ApiController]
[Route("api/travel-plans/{travelPlanId:int}/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenses;

    public ExpensesController(IExpenseService expenses) => _expenses = expenses;

    private int UserId => User.GetUserId();

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Add(int travelPlanId, [FromBody] CreateExpenseRequest request)
    {
        var (ok, error, data) = await _expenses.AddAsync(travelPlanId, UserId, request);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    [HttpDelete("{expenseId:int}")]
    public async Task<IActionResult> Delete(int travelPlanId, int expenseId)
    {
        _ = travelPlanId;
        var (ok, error) = await _expenses.DeleteAsync(expenseId, UserId);
        if (!ok)
            return NotFound(new { message = error });
        return NoContent();
    }
}
