using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BuildingBlocks.Auth;
using Identity.Api.Data;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Api.Auth;

/// <summary>
/// Issues short-name JWT claims (sub/name/email/role) matching what
/// BuildingBlocks.Auth.JwtAuthenticationExtensions configures every resource service to expect.
/// </summary>
public class TokenService(JwtSettings jwtSettings) : ITokenService
{
    public (string Token, DateTime ExpiresAt) CreateToken(ApplicationUser user, IList<string> roles)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(jwtSettings.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("name", user.UserName!),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(role => new Claim("role", role)));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
