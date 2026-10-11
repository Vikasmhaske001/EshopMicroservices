using BuildingBlocks.Auth;
using BuildingBlocks.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

const string AngularClientPolicy = "AngularClient";

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogDefaults("YarpApiGateway");

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularClientPolicy, policy =>
        policy.WithOrigins(
                  builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? [])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy => policy.RequireRole(AppRoles.Admin));
});

builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    rateLimiterOptions.AddFixedWindowLimiter("fixed", options =>
    {
        options.Window = TimeSpan.FromSeconds(10);
        options.PermitLimit = 5;
    });
});

var app = builder.Build();

app.UseCorrelationId();

app.UseCors(AngularClientPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapReverseProxy();

app.Run();
