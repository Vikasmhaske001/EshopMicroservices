using BuildingBlocks.Messaging.Events;
using MassTransit;
using Basket.API.Dtos;

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
    (IBasketRepository repository, IPublishEndpoint publishEndpoint)
    : ICommandHandler<CheckoutBasketCommand, CheckoutBasketResult>
{
    public async Task<CheckoutBasketResult> Handle(CheckoutBasketCommand command, CancellationToken cancellationToken)
    {
        // get existing basket with total price
        // Set totalprice on basketcheckout event message
        // send basket checkout event to rabbitmq using masstransit
        // delete the basket

        var basket = await repository.GetBasket(command.BasketCheckoutDto.UserName, cancellationToken);
        if (basket == null)
        {
            return new CheckoutBasketResult(false);
        }

        if (basket.Items.Count == 0)
        {
            throw new BadRequestException("Basket is empty and cannot be checked out.");
        }

        var eventMessage = command.BasketCheckoutDto.Adapt<BasketCheckoutEvent>();
        eventMessage.TotalPrice = basket.TotalPrice;

        // Carry the real basket lines on the event. EffectivePrice is sent because Basket owns
        // discounting - Ordering must never call Discount.Grpc or re-apply the discount.
        eventMessage.Items = basket.Items
            .Select(item => new BasketCheckoutItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.EffectivePrice
            })
            .ToList();

        await publishEndpoint.Publish(eventMessage, cancellationToken);

        await repository.DeleteBasket(command.BasketCheckoutDto.UserName, cancellationToken);

        return new CheckoutBasketResult(true);
    }
}
