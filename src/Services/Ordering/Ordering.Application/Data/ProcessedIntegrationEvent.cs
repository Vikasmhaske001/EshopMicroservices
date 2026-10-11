namespace Ordering.Application.Data;

public class ProcessedIntegrationEvent
{
    public Guid Id { get; set; }

    public string EventType { get; set; } = default!;

    public DateTime ProcessedAt { get; set; }
}
