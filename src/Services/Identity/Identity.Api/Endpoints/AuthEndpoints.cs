using BuildingBlocks.Auth;
using Carter;
using FluentValidation;
using Identity.Api.Auth;
using Identity.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Api.Endpoints;

public record RegisterRequest(string UserName, string Email, string Password);
public record LoginRequest(string UserName, string Password);
public record RefreshRequest(string RefreshToken);
public record LogoutRequest(string RefreshToken);
public record AuthResponse(string Token, DateTime ExpiresAt, string UserName, IEnumerable<string> Roles, string RefreshToken);

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().MinimumLength(3);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class AuthEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth");

        group.MapPost("/register", async (
            RegisterRequest request,
            IValidator<RegisterRequest> validator,
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            IdentityDbContext dbContext,
            JwtSettings jwtSettings,
            CancellationToken cancellationToken) =>
        {
            var validation = await validator.ValidateAsync(request, cancellationToken);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            var user = new ApplicationUser
            {
                UserName = request.UserName,
                Email = request.Email
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return Results.BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            await userManager.AddToRoleAsync(user, AppRoles.Customer);

            var response = await IssueTokensAsync(user, [AppRoles.Customer], tokenService, dbContext, jwtSettings, cancellationToken);
            return Results.Created($"/auth/users/{user.Id}", response);
        })
        .WithName("Register")
        .Produces<AuthResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Register a new customer account");

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            IdentityDbContext dbContext,
            JwtSettings jwtSettings,
            CancellationToken cancellationToken) =>
        {
            var user = await userManager.FindByNameAsync(request.UserName);
            if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            {
                return Results.Unauthorized();
            }

            var roles = await userManager.GetRolesAsync(user);
            var response = await IssueTokensAsync(user, roles, tokenService, dbContext, jwtSettings, cancellationToken);

            return Results.Ok(response);
        })
        .WithName("Login")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Authenticate and receive an access token + refresh token");

        group.MapPost("/refresh", async (
            RefreshRequest request,
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            IdentityDbContext dbContext,
            JwtSettings jwtSettings,
            CancellationToken cancellationToken) =>
        {
            var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
            var stored = await dbContext.RefreshTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

            if (stored is null || !stored.IsActive)
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(stored.UserId.ToString());
            if (user is null)
            {
                return Results.Unauthorized();
            }

            stored.RevokedAt = DateTime.UtcNow;

            var roles = await userManager.GetRolesAsync(user);
            var response = await IssueTokensAsync(user, roles, tokenService, dbContext, jwtSettings, cancellationToken);

            return Results.Ok(response);
        })
        .WithName("Refresh")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Exchange a refresh token for a new access token + refresh token");

        group.MapPost("/logout", async (
            LogoutRequest request,
            ITokenService tokenService,
            IdentityDbContext dbContext,
            CancellationToken cancellationToken) =>
        {
            var tokenHash = tokenService.HashRefreshToken(request.RefreshToken);
            var stored = await dbContext.RefreshTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

            if (stored is not null && stored.IsActive)
            {
                stored.RevokedAt = DateTime.UtcNow;
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return Results.NoContent();
        })
        .WithName("Logout")
        .Produces(StatusCodes.Status204NoContent)
        .WithSummary("Revoke a refresh token");
    }

    private static async Task<AuthResponse> IssueTokensAsync(
        ApplicationUser user, IList<string> roles, ITokenService tokenService,
        IdentityDbContext dbContext, JwtSettings jwtSettings, CancellationToken cancellationToken)
    {
        var (accessToken, expiresAt) = tokenService.CreateAccessToken(user, roles);

        var refreshToken = tokenService.GenerateRefreshToken();
        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenService.HashRefreshToken(refreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenExpirationDays)
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(accessToken, expiresAt, user.UserName!, roles, refreshToken);
    }
}
