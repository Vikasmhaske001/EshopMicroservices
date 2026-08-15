using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordering.Domain.Models;
using Ordering.Domain.ValueObjects;

namespace Ordering.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.Id).HasConversion(
                                   orderItemId => orderItemId.Value,
                                   dbId => OrderItemId.Of(dbId));

        builder.Property(oi => oi.OrderId).HasConversion(
                                   orderId => orderId.Value,
                                   dbId => OrderId.Of(dbId));

        // ProductId identifies a Catalog product and is intentionally NOT a foreign key.
        // Ordering owns no product data, so a local constraint would reject valid orders for
        // products Catalog knows about but this service has never seen.
        builder.Property(oi => oi.ProductId).HasConversion(
                                   productId => productId.Value,
                                   dbId => ProductId.Of(dbId));

        builder.Property(oi => oi.Quantity).IsRequired();

        builder.Property(oi => oi.Price).IsRequired().HasPrecision(18, 2);
    }
}
