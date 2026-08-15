using Microsoft.AspNetCore.RateLimiting;

const string AngularClientPolicy = "AngularClient";

var builder = WebApplication.CreateBuilder(args);

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
// CORS runs before the rate limiter so preflight requests are answered rather than throttled.
app.UseCors(AngularClientPolicy);

app.UseRateLimiter();

app.MapReverseProxy();

app.Run();
