using TravelApp.Api.DTOs;
using TravelApp.Api.Models;
using TravelApp.Api.UserModule.Repositories;

namespace TravelApp.Api.UserModule.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtTokenService _jwt;

    public AuthService(IUserRepository users, IJwtTokenService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    public async Task<(bool ok, string? error, AuthResponse? data)> RegisterAsync(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await _users.GetByEmailAsync(normalizedEmail);
        if (existing != null)
            return (false, "Email already registered.", null);

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.User
        };

        await _users.AddAsync(user);

        var response = new AuthResponse
        {
            Token = _jwt.CreateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString()
        };

        return (true, null, response);
    }

    public async Task<(bool ok, string? error, AuthResponse? data)> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (false, "Invalid email or password.", null);

        var response = new AuthResponse
        {
            Token = _jwt.CreateToken(user),
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString()
        };

        return (true, null, response);
    }
}
