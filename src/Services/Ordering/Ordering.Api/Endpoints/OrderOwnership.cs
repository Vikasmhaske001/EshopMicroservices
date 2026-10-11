using System.Security.Claims;
using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions;

namespace Ordering.API.Endpoints;

/// <summary>Enforces that a customer can only act on their own orders; Admins can act on any.</summary>
public static class OrderOwnership
{
    public static void EnsureOwnerOrAdmin(ClaimsPrincipal user, Guid customerId)
    {
        if (user.IsAdmin())
        {
            return;
        }

        if (user.GetUserId() != customerId)
        {
            throw new ForbiddenAccessException("You may only access your own orders.");
        }
    }
}
