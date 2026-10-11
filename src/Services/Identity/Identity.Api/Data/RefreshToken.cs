namespace Identity.Api.Data;

/// <summary>
/// A long-lived credential that lets a client obtain a new access token without re-entering
/// credentials. Only the SHA-256 hash is stored - never the raw token - so a database leak alone
/// doesn't hand out working refresh tokens (the same principle as password hashing).
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;
}
