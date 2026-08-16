using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions.Handler;
using Carter;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace Ordering.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCarter();

        // Every Ordering endpoint requires a valid JWT; ownership/role checks are then applied
        // per-endpoint (customer-scoped vs Admin-only) rather than through a single blanket rule.
        services.AddJwtAuthentication(configuration);
        services.AddAuthorization(options =>
            options.AddPolicy(AuthorizationPolicies.AdminOnly, policy => policy.RequireRole(AppRoles.Admin)));

        services.AddExceptionHandler<CustomExceptionHandler>();
        services.AddHealthChecks()
            .AddSqlServer(configuration.GetConnectionString("Database")!);

        return services;
    }

    public static WebApplication UseApiServices(this WebApplication app)
    {
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapCarter();

        app.UseExceptionHandler(options => { });
        app.UseHealthChecks("/health",
            new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

        return app;
    }
}

