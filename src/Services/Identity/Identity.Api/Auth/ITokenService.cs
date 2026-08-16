using Identity.Api.Data;

namespace Identity.Api.Auth;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateToken(ApplicationUser user, IList<string> roles);
}
