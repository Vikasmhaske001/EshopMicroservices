using Microsoft.AspNetCore.Builder;
using Serilog;
using Serilog.Events;

namespace BuildingBlocks.Logging;

public static class SerilogExtensions
{
    public static WebApplicationBuilder AddSerilogDefaults(this WebApplicationBuilder builder, string applicationName)
    {
        builder.Host.UseSerilog((context, services, configuration) =>
        {
            configuration
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", applicationName)
                .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
                .Enrich.WithMachineName()
                .WriteTo.Console(
                    outputTemplate:
                    "[{Timestamp:HH:mm:ss} {Level:u3}] ({Application}/{MachineName}) {CorrelationId} {Message:lj}{NewLine}{Exception}");
        });

        return builder;
    }
}
