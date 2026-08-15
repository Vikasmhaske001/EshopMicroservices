namespace BuildingBlocks.Messaging.Events;

/// <summary>
/// A single basket line carried by <see cref="BasketCheckoutEvent"/>.
/// Deliberately independent of Basket's ShoppingCartItem and Ordering's OrderItem:
/// this is the cross-service contract, not a persistence model.
/// </summary>
public record BasketCheckoutItem
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    /// <summary>
    /// Final payable unit price. Basket owns discounting, so the discount is already
    /// applied here and Ordering must not apply it again.
    /// </summary>
    public decimal Price { get; set; }
}
