namespace BuildingBlocks.Messaging.Events;

public record IntegrationEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredOn { get; init; } = DateTime.Now;

    public string EventType => GetType().AssemblyQualifiedName;
}
