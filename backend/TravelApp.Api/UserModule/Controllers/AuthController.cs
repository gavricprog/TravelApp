using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelApp.Api.DTOs;
using TravelApp.Api.UserModule.Services;

namespace TravelApp.Api.UserModule.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var (ok, error, data) = await _auth.RegisterAsync(request);
        if (!ok)
            return BadRequest(new { message = error });
        return Ok(data);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var (ok, error, data) = await _auth.LoginAsync(request);
        if (!ok)
            return Unauthorized(new { message = error });
        return Ok(data);
    }
}
