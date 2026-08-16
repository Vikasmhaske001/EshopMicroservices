namespace Basket.API.Models
{
    public class ShoppingCart
    {
        public string UserName { get; set; } = default!;
        public List<ShoppingCartItem> Items { get; set; } = new();
        public decimal TotalPrice => Items.Sum(x => x.EffectivePrice * x.Quantity);

        /// <summary>
        /// Set the first time checkout publishes an event for this basket's current contents, and
        /// cleared only when the basket is deleted. If a crash happens after Publish but before
        /// DeleteBasket, the basket survives with this already set - a retried checkout reuses the
        /// same event Id instead of minting a new one, so Ordering's existing idempotency check
        /// absorbs the retry instead of creating a second order.
        /// </summary>
        public Guid? CheckoutEventId { get; set; }

        public ShoppingCart(string userName)
        {
            UserName = userName;
        }

        //Required for Mapping
        public ShoppingCart()
        {
        }

    }
}
