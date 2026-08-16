namespace BuildingBlocks.Auth;

/// <summary>
/// Bound from the "Jwt" configuration section. Every service that issues or validates tokens
/// reads the same section, so Identity.Api (issuer) and the resource services (validators)
/// must be configured with matching values - this is what makes the shared secret work.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;

    /// <summary>
    /// Symmetric signing key. Development-only value lives in configuration/environment
    /// variables, never in source code. A production deployment must supply its own secret
    /// via environment variables or a secret store - see Program.cs comments.
    /// </summary>
    public string Key { get; set; } = default!;

    public int ExpirationMinutes { get; set; } = 60;
}
