using TravelApp.Api.Models;

namespace TravelApp.Api.UserModule.Services;

public interface IJwtTokenService
{
    string CreateToken(User user);
}
