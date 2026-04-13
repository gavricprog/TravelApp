namespace TravelApp.Api.Models;

/// <summary>Simple role enum for JWT claims — USER is default after register.</summary>
public enum UserRole
{
    User = 0,
    Admin = 1
}
