using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TravelApp.Api.Infrastructure;

public static class ClaimsExtensions
{
    /// <summary>Reads the numeric user id we put in JWT "sub" claim.</summary>
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (sub == null || !int.TryParse(sub, out var id))
            throw new InvalidOperationException("User id claim missing.");
        return id;
    }
}
