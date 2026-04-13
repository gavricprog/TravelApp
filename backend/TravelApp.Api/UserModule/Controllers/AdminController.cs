using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelApp.Api.Data;

namespace TravelApp.Api.UserModule.Controllers;

/// <summary>Proves ADMIN role is enforced — only users with Role=Admin in JWT can call this.</summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db) => _db = db;

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
}
