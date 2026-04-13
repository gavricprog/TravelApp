using TravelApp.Api.DTOs;

namespace TravelApp.Api.UserModule.Services;

public interface IAuthService
{
    Task<(bool ok, string? error, AuthResponse? data)> RegisterAsync(RegisterRequest request);
    Task<(bool ok, string? error, AuthResponse? data)> LoginAsync(LoginRequest request);
}
