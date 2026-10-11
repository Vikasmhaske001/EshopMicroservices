using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace BuildingBlocks.Messaging.MassTransit;

public static class Extentions
{
    public static IServiceCollection AddMessageBroker
        (this IServiceCollection services, IConfiguration configuration, Assembly? assembly = null)
    {
        services.AddMassTransit(config =>
        {
            config.SetKebabCaseEndpointNameFormatter();

            if (assembly != null)
                config.AddConsumers(assembly);

            config.UsingRabbitMq((context, configurator) =>
            {
                configurator.Host(new Uri(configuration["MessageBroker:Host"]!), host =>
                {
                    host.Username(configuration["MessageBroker:UserName"]);
                    host.Password(configuration["MessageBroker:Password"]);
                });

                // Applies to every consumer configured below (only Ordering has one today).
                // Without this, a single transient failure (e.g. a momentary DB blip) sends the
                // message straight to <queue>_error with no retry attempt at all. 3 retries, 5s
                // apart, is enough to ride out a brief hiccup without masking a real/permanent
                // failure - after the 3rd failure the message still moves to the error queue.
                configurator.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));

                configurator.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
