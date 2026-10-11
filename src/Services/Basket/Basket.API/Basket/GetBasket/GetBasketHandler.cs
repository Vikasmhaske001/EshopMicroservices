using Basket.API.Exceptions;

namespace Basket.API.Basket.GetBasket;
public record GetBasketQuery(string UserName) : IQuery<GetBasketResult>;
public record GetBasketResult(ShoppingCart Cart);

public class GetBasketQueryHandler(IBasketRepository repository)
    : IQueryHandler<GetBasketQuery, GetBasketResult>
{
    public async Task<GetBasketResult> Handle(GetBasketQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var basket = await repository.GetBasket(query.UserName, cancellationToken);
            return new GetBasketResult(basket);
        }
        catch (BasketNotFoundException)
        {
            // A user who has never added anything is a normal state, not an error - return an
            // empty cart instead of 404 so callers don't have to special-case "no basket yet"
            // versus a real failure. StoreBasket/DeleteBasket/Checkout still require a basket to
            // exist and are unaffected - only this read path is lenient.
            return new GetBasketResult(new ShoppingCart(query.UserName));
        }
    }
}
