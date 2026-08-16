using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace BuildingBlocks.Logging;

/// <summary>
/// Reuses the caller's X-Correlation-Id if present, otherwise generates one. The id is written
/// back onto both the request (so YARP forwards it downstream unchanged - no second id is ever
/// generated further down the chain) and the response (so the caller can see it, including on
/// error responses, since this middleware sits outside UseExceptionHandler).
/// </summary>
public class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers.TryGetValue(HeaderName, out var existing)
                             && !string.IsNullOrWhiteSpace(existing)
            ? existing.ToString()
            : Guid.NewGuid().ToString();

        context.Request.Headers[HeaderName] = correlationId;
        context.Response.Headers[HeaderName] = correlationId;
        context.Items[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}

public static class CorrelationIdExtensions
{
    /// <summary>Register first in the pipeline so the response header survives even a 500.</summary>
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        => app.UseMiddleware<CorrelationIdMiddleware>();

    /// <summary>Reads the correlation id set by <see cref="CorrelationIdMiddleware"/> for the current request.</summary>
    public static string? GetCorrelationId(this HttpContext context)
        => context.Items[CorrelationIdMiddleware.HeaderName] as string;
}
