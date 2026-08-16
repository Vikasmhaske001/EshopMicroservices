using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions.Handler;
using BuildingBlocks.Logging;
using Carter;
using FluentValidation;
using HealthChecks.UI.Client;
using Identity.Api.Auth;
using Identity.Api.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogDefaults("Identity.Api");

builder.Services.AddCarter();

builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        // Relaxed for a demo/interview project; a production policy would be stricter.
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<IdentityDbContext>();

// Signing key comes from configuration/environment (Jwt:Key), never hardcoded in source.
// See docker-compose.override.yml / appsettings.Development.json for the development-only value.
builder.Services.AddSingleton(builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Missing 'Jwt' configuration section."));
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Database")!);

var app = builder.Build();

app.UseCorrelationId();

app.MapCarter();

app.UseExceptionHandler(opt => { });

app.UseHealthChecks("/health",
    new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse });

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await db.Database.MigrateAsync();
}

await IdentitySeeder.SeedAsync(app.Services);

app.Run();
