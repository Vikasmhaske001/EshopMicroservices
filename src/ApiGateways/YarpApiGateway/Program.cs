using BuildingBlocks.Auth;
using BuildingBlocks.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

const string AngularClientPolicy = "AngularClient";

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogDefaults("YarpApiGateway");

// Add services to the container.
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// The browser talks only to the gateway, so CORS is configured here rather than in each service.
// Origins are explicit (no AllowAnyOrigin) so credentials can be enabled later without rework.
builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularClientPolicy, policy =>
        policy.WithOrigins(
                  builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? [])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Coarse-grained gate for external traffic. Routes opt out via the YARP-recognized
// AuthorizationPolicy: "anonymous" (public reads, /auth/*); everything else falls back to
// RequireAuthenticatedUser. Each downstream service re-validates the token itself and applies
// its own fine-grained (ownership/role) rules - the gateway is not the only line of defense.
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

// Configure the HTTP request pipeline.
// First middleware: the correlation id assigned/reused here is written onto the request headers,
// so it rides along on the proxied call to whichever service YARP forwards to - the entry point
// for the whole system is the right place to mint it once.
app.UseCorrelationId();

// CORS runs before auth so preflight requests are answered rather than challenged/throttled.
app.UseCors(AngularClientPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapReverseProxy();

app.Run();
