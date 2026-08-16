using BuildingBlocks.Auth;
using Catalog.API.Data;
using HealthChecks.UI.Client;

var builder = WebApplication.CreateBuilder(args);

// Reads are public (see route-level RequireAuthorization on the write endpoints only); auth is
// still wired up here so this service independently validates JWTs for its Admin-only mutations
// rather than trusting the gateway blindly (defense in depth).
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options =>
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy => policy.RequireRole(AppRoles.Admin)));

var assembly = typeof(Program).Assembly;
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));
});

builder.Services.AddCarter();

builder.Services.AddValidatorsFromAssembly(assembly);

builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
}).UseLightweightSessions();

if(builder.Environment.IsDevelopment())
    builder.Services.InitializeMartenWith<CatalogInitialData>();

builder.Services.AddExceptionHandler<CustomExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddHealthChecks().AddNpgSql(builder.Configuration.GetConnectionString("Database")!);

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapCarter();

app.UseExceptionHandler();

app.UseHealthChecks("/health",
    
    new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        ResponseWriter= UIResponseWriter.WriteHealthCheckUIResponse
    });

app.Run();
