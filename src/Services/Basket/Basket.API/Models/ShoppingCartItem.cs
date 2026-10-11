namespace Basket.API.Models
{
    public class ShoppingCartItem
    {
        public int Quantity { get; set; } = default!;
        public string Color { get; set; } = default!;

        /// <summary>Catalog list price. Never mutated by discounting.</summary>
        public decimal Price { get; set; } = default!;

        /// <summary>Discount applied to <see cref="Price"/>, assigned from Discount.Grpc on every store.</summary>
        public decimal DiscountAmount { get; set; }

        /// <summary>Price actually charged for one unit.</summary>
        public decimal EffectivePrice => Price - DiscountAmount;

        public Guid ProductId { get; set; } = default!;
        public string ProductName { get; set; } = default!;

    }
}
