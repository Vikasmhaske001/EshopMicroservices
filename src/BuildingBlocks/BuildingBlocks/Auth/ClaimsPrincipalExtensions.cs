using System.Security.Claims;

namespace BuildingBlocks.Auth;

public static class ClaimsPrincipalExtensions
{
    /// <summary>The authenticated user's stable id (JWT "sub" claim).</summary>
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst("sub")?.Value
            ?? throw new InvalidOperationException("Token has no 'sub' claim.");

        return Guid.Parse(value);
    }

    /// <summary>The authenticated user's username (JWT "name" claim) - matches Basket's UserName.</summary>
    public static string GetUserName(this ClaimsPrincipal user)
    {
        return user.Identity?.Name
            ?? throw new InvalidOperationException("Token has no 'name' claim.");
    }

    public static bool IsAdmin(this ClaimsPrincipal user) => user.IsInRole(AppRoles.Admin);
}
