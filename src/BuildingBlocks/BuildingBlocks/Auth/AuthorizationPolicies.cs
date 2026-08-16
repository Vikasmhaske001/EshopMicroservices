namespace BuildingBlocks.Auth;

public static class AuthorizationPolicies
{
    /// <summary>Caller must hold the Admin role.</summary>
    public const string AdminOnly = "AdminOnly";
}
