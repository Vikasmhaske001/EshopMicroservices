using System.Security.Claims;
using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions;

namespace Basket.API.Basket;

/// <summary>
/// Baskets are still keyed by UserName rather than by JWT subject (see Step 5 report -
/// migrating the route contract to claims-only identity is a follow-up). Until then, every
/// endpoint must check that the caller's own username matches the basket it is touching.
/// </summary>
public static class BasketOwnership
{
    public static void EnsureOwnerOrAdmin(ClaimsPrincipal user, string userName)
    {
        if (user.IsAdmin())
        {
            return;
        }

        if (!string.Equals(user.GetUserName(), userName, StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenAccessException("You may only access your own basket.");
        }
    }

    public static void EnsureOwnerOrAdmin(ClaimsPrincipal user, Guid customerId)
    {
        if (user.IsAdmin())
        {
            return;
        }

        if (user.GetUserId() != customerId)
        {
            throw new ForbiddenAccessException("You may only check out your own basket.");
        }
    }
}
