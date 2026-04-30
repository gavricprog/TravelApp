using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Data;
using TravelApp.Api.DTOs;
using TravelApp.Api.Infrastructure;
using TravelApp.Api.Models;

namespace TravelApp.Api.UserModule.Controllers;

/// <summary>Proves ADMIN role is enforced — only users with Role=Admin in JWT can call this.</summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db) => _db = db;

    private int CurrentUserId => User.GetUserId();

    [HttpGet("stats")]
    public async Task<ActionResult<object>> Stats()
    {
        return Ok(new
        {
            userCount = await _db.Users.CountAsync(),
            travelPlanCount = await _db.TravelPlans.CountAsync(),
            note = "This endpoint requires an Admin JWT (set Role=1 in DB for your user, then log in again)."
        });
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> Users()
    {
        var users = await _db.Users
            .AsNoTracking()
            .OrderBy(u => u.Email)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Email = u.Email,
                Role = u.Role.ToString()
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (id == CurrentUserId)
            return BadRequest(new { message = "Admins cannot delete their own account." });

        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("users/{id:int}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: false, out var role))
            return BadRequest(new { message = "Role must be User or Admin." });

        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        user.Role = role;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("travel-plans")]
    public async Task<ActionResult<List<AdminTravelPlanDto>>> TravelPlans()
    {
        var plans = await _db.TravelPlans
            .AsNoTracking()
            .Include(p => p.User)
            .Include(p => p.Expenses)
            .Include(p => p.Activities)
            .OrderByDescending(p => p.StartDate)
            .Select(p => new AdminTravelPlanDto
            {
                Id = p.Id,
                Title = p.Title,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Budget = p.Budget,
                TotalExpenses = p.Expenses.Sum(e => e.Amount) +
                    p.Activities
                        .Where(a => a.Status == ActivityStatus.Done)
                        .Sum(a => a.Cost ?? 0),
                OwnerId = p.UserId,
                OwnerEmail = p.User.Email
            })
            .ToListAsync();

        return Ok(plans);
    }

    [HttpDelete("travel-plans/{id:int}")]
    public async Task<IActionResult> DeleteTravelPlan(int id)
    {
        var plan = await _db.TravelPlans.FindAsync(id);
        if (plan == null)
            return NotFound(new { message = "Travel plan not found." });

        _db.TravelPlans.Remove(plan);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
