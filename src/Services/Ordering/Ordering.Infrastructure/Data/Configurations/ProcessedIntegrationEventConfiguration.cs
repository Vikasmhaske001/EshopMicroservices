using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Application.Data;

namespace Ordering.Infrastructure.Data.Configurations;

public class ProcessedIntegrationEventConfiguration : IEntityTypeConfiguration<ProcessedIntegrationEvent>
{
    public void Configure(EntityTypeBuilder<ProcessedIntegrationEvent> builder)
    {
        builder.ToTable("ProcessedIntegrationEvents");

        builder.HasKey(e => e.Id);

        // The key is the event's own Id, supplied by the producer - never database-generated.
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.EventType).HasMaxLength(255).IsRequired();

        builder.Property(e => e.ProcessedAt).IsRequired();
    }
}
