using BuildingBlocks.Auth;
using Carter;
using FluentValidation;
using Identity.Api.Auth;
using Identity.Api.Data;
using Microsoft.AspNetCore.Identity;

namespace Identity.Api.Endpoints;

public record RegisterRequest(string UserName, string Email, string Password);
public record LoginRequest(string UserName, string Password);
public record AuthResponse(string Token, DateTime ExpiresAt, string UserName, IEnumerable<string> Roles);

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
            ITokenService tokenService) =>
        {
            var validation = await validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.ToDictionary());
            }

            // Self-registration always grants the Customer role - Admin accounts are seeded only.
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

            var (token, expiresAt) = tokenService.CreateToken(user, [AppRoles.Customer]);
            return Results.Created($"/auth/users/{user.Id}", new AuthResponse(token, expiresAt, user.UserName, [AppRoles.Customer]));
        })
        .WithName("Register")
        .Produces<AuthResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Register a new customer account");

        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService) =>
        {
            var user = await userManager.FindByNameAsync(request.UserName);
            if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            {
                // Same response for "no such user" and "wrong password" - do not reveal which.
                return Results.Unauthorized();
            }

            var roles = await userManager.GetRolesAsync(user);
            var (token, expiresAt) = tokenService.CreateToken(user, roles);

            return Results.Ok(new AuthResponse(token, expiresAt, user.UserName!, roles));
        })
        .WithName("Login")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .WithSummary("Authenticate and receive a JWT");
    }
}
