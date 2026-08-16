using BuildingBlocks.Auth;
using BuildingBlocks.Behaviors;
using BuildingBlocks.Exceptions.Handler;
using BuildingBlocks.Logging;
using BuildingBlocks.Messaging.MassTransit;
using BuildingBlocks.Swagger;
using Discount.Grpc;
using HealthChecks.UI.Client;
using Microsoft.Extensions.Caching.Distributed;

var builder = WebApplication.CreateBuilder(args);

builder.AddSerilogDefaults("Basket.API");

var assembly = typeof(Program).Assembly;
builder.Services.AddCarter();
builder.Services.AddHttpContextAccessor();

// Basket holds per-user data, so every endpoint here requires a valid JWT; ownership within
// that (which basket) is enforced per-endpoint via BasketOwnership.
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization();
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(assembly);
    config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    config.AddOpenBehavior(typeof(LoggingBehavior<,>));
});

// Was missing entirely: StoreBasketCommandValidator/CheckoutBasketCommandValidator existed but
// were never registered, so ValidationBehavior resolved an empty validator list and validated
// nothing (e.g. an empty UserName would have sailed through FluentValidation, though it still
// happened to fail later via other checks).
builder.Services.AddValidatorsFromAssembly(assembly);

builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
    opts.Schema.For<ShoppingCart>().Identity(x => x.UserName);
}).UseLightweightSessions();

builder.Services.AddScoped<IBasketRepository, BasketRepository>();
builder.Services.Decorate<IBasketRepository, CachedBasketRepository>();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

//Grpc Services
builder.Services.AddGrpcClient<DiscountProtoService.DiscountProtoServiceClient>(options =>
{
    options.Address = new Uri(builder.Configuration["GrpcSettings:DiscountUrl"]!);
})
.ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler
    {
        ServerCertificateCustomValidationCallback =
        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    };

    return handler;
});

builder.Services.AddMessageBroker(builder.Configuration);

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Database")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

builder.Services.AddSwaggerWithJwtAuth("Basket.API");

var app = builder.Build();

app.UseCorrelationId();

app.UseSwaggerWithUi();

app.UseAuthentication();
app.UseAuthorization();

app.MapCarter();

app.UseExceptionHandler(opt =>{});

app.UseHealthChecks("/health",
    new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        ResponseWriter= UIResponseWriter.WriteHealthCheckUIResponse
    });

app.Run();