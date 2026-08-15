namespace Ordering.Application.Data;

/// <summary>
/// Record of an integration event this service has already handled. RabbitMQ delivers
/// at-least-once, so consumers use this to avoid acting on the same message twice.
/// Not a domain concept - it is application-boundary plumbing.
/// </summary>
public class ProcessedIntegrationEvent
{
    /// <summary>The integration event's own stable Id.</summary>
    public Guid Id { get; set; }

    public string EventType { get; set; } = default!;

    public DateTime ProcessedAt { get; set; }
}
