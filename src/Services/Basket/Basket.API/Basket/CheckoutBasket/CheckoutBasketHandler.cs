using BuildingBlocks.Logging;
using BuildingBlocks.Messaging.Events;
using MassTransit;
using Basket.API.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Basket.API.Basket.CheckoutBasket;

public record CheckoutBasketCommand(BasketCheckoutDto BasketCheckoutDto)
    : ICommand<CheckoutBasketResult>;
public record CheckoutBasketResult(bool IsSuccess);

public class CheckoutBasketCommandValidator
    : AbstractValidator<CheckoutBasketCommand>
{
    public CheckoutBasketCommandValidator()
    {
        RuleFor(x => x.BasketCheckoutDto).NotNull().WithMessage("BasketCheckoutDto can't be null");
        RuleFor(x => x.BasketCheckoutDto.UserName).NotEmpty().WithMessage("UserName is required");
    }
}

public class CheckoutBasketCommandHandler
    (IBasketRepository repository, IPublishEndpoint publishEndpoint,
     IHttpContextAccessor httpContextAccessor, ILogger<CheckoutBasketCommandHandler> logger)
    : ICommandHandler<CheckoutBasketCommand, CheckoutBasketResult>
{
    public async Task<CheckoutBasketResult> Handle(CheckoutBasketCommand command, CancellationToken cancellationToken)
    {
        // get existing basket with total price
        // Set totalprice on basketcheckout event message
        // send basket checkout event to rabbitmq using masstransit
        // delete the basket

        logger.LogInformation("Checkout started for {UserName}", command.BasketCheckoutDto.UserName);

        var basket = await repository.GetBasket(command.BasketCheckoutDto.UserName, cancellationToken);
        if (basket == null)
        {
            return new CheckoutBasketResult(false);
        }

        // Validate before publishing: an invalid basket must fail here with 400 rather than
        // produce an event that Ordering's domain rejects after the caller already got 200 OK.
        ValidateBasketForCheckout(basket);

        // Reuse the event Id from an earlier attempt if one already got as far as publishing for
        // this basket (see ShoppingCart.CheckoutEventId). A brand-new basket gets a fresh Id.
        var isRetryOfPublishedCheckout = basket.CheckoutEventId is not null;
        var checkoutEventId = basket.CheckoutEventId ?? Guid.NewGuid();

        if (!isRetryOfPublishedCheckout)
        {
            // Persist the intent to publish BEFORE publishing. If the process dies between here
            // and DeleteBasket, the basket survives with this Id already recorded, so the next
            // checkout attempt takes the branch above instead of generating a new event Id.
            basket.CheckoutEventId = checkoutEventId;
            await repository.StoreBasket(basket, cancellationToken);
        }

        var eventMessage = command.BasketCheckoutDto.Adapt<BasketCheckoutEvent>();
        eventMessage = eventMessage with { Id = checkoutEventId };
        eventMessage.TotalPrice = basket.TotalPrice;

        // Carry the real basket lines on the event. EffectivePrice is sent because Basket owns
        // discounting - Ordering must never call Discount.Grpc or re-apply the discount.
        eventMessage.Items = basket.Items
            .Select(item => new BasketCheckoutItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                Price = item.EffectivePrice
            })
            .ToList();

        // Carry the correlation id as a transport header rather than adding it to the business
        // event contract - Ordering reads it back off ConsumeContext.Headers.
        var correlationId = httpContextAccessor.HttpContext?.GetCorrelationId();

        await publishEndpoint.Publish(eventMessage, context =>
        {
            if (correlationId is not null)
            {
                context.Headers.Set(CorrelationIdMiddleware.HeaderName, correlationId);
            }
        }, cancellationToken);

        logger.LogInformation("Checkout event published {EventId} for {UserName}",
            checkoutEventId, command.BasketCheckoutDto.UserName);

        await repository.DeleteBasket(command.BasketCheckoutDto.UserName, cancellationToken);

        logger.LogInformation("Basket deleted for {UserName}", command.BasketCheckoutDto.UserName);

        return new CheckoutBasketResult(true);
    }

    // Guards the obviously-invalid cases at the service boundary. Ordering's domain remains the
    // authority on order invariants; this is not a copy of those rules.
    private static void ValidateBasketForCheckout(ShoppingCart basket)
    {
        if (basket.Items.Count == 0)
        {
            throw new BadRequestException("Basket is empty and cannot be checked out.");
        }

        foreach (var item in basket.Items)
        {
            if (item.ProductId == Guid.Empty)
            {
                throw new BadRequestException("Basket contains an item with an empty ProductId.");
            }

            if (item.Quantity <= 0)
            {
                throw new BadRequestException($"Quantity must be greater than zero for product {item.ProductId}.");
            }

            if (item.Price <= 0)
            {
                throw new BadRequestException($"Price must be greater than zero for product {item.ProductId}.");
            }

            if (item.EffectivePrice <= 0)
            {
                throw new BadRequestException($"Effective price must be greater than zero for product {item.ProductId}.");
            }
        }
    }
}
