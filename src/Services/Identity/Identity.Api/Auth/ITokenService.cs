using Identity.Api.Data;

namespace Identity.Api.Auth;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(ApplicationUser user, IList<string> roles);

    /// <summary>A cryptographically random opaque string - not a JWT, just a lookup credential.</summary>
    string GenerateRefreshToken();

    /// <summary>One-way hash used for storage/lookup - the raw token is never persisted.</summary>
    string HashRefreshToken(string refreshToken);
}
