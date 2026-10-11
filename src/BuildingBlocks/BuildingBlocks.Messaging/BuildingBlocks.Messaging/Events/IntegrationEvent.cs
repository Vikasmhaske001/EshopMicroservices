namespace BuildingBlocks.Messaging.Events;

public record IntegrationEvent
{
    // Assigned once at construction and carried with the message, so consumers can use it as a
    // stable identity for de-duplication. These were previously expression-bodied properties,
    // which returned a different value on every read and could not identify a message.
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredOn { get; init; } = DateTime.Now;

    public string EventType => GetType().AssemblyQualifiedName;
}
