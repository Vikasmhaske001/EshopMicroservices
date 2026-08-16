using Ordering.Domain.Abstractions;

namespace Ordering.Domain.Models;

public class OrderItem : Entity<OrderItemId>
{
    internal OrderItem(OrderId orderId, ProductId productId, int quantity, decimal price, string productName)
    {
        Id = OrderItemId.Of(Guid.NewGuid());
        OrderId = orderId;
        ProductId = productId;
        Quantity = quantity;
        Price = price;
        ProductName = productName;
    }

    public OrderId OrderId { get; private set; } = default!;
    public ProductId ProductId { get; private set; } = default!;
    public int Quantity { get; private set; } = default!;
    public decimal Price { get; private set; } = default!;

    /// <summary>
    /// Snapshot of the product's name at checkout time. Ordering owns no Catalog data, so this
    /// is captured once here rather than looked up live - order history stays correct even if
    /// Catalog later renames or deletes the product.
    /// </summary>
    public string ProductName { get; private set; } = default!;
}
