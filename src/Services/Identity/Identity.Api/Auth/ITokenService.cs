using Identity.Api.Data;

namespace Identity.Api.Auth;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(ApplicationUser user, IList<string> roles);

    string GenerateRefreshToken();

    string HashRefreshToken(string refreshToken);
}
