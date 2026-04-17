using System.ComponentModel.DataAnnotations;

namespace TravelApp.Api.DTOs;

public class RegisterRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "Password must contain upper/lowercase letters and at least one number.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
