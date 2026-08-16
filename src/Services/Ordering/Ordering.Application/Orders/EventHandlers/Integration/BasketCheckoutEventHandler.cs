using BuildingBlocks.Messaging.Events;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Application.Orders.Commands.CreateOrder;

namespace Ordering.Application.Orders.EventHandlers.Integration;

public class BasketCheckoutEventHandler
    (ISender sender, IApplicationDbContext dbContext, ILogger<BasketCheckoutEventHandler> logger)
    : IConsumer<BasketCheckoutEvent>
{
    public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
    {
        var message = context.Message;

        if (await dbContext.ProcessedIntegrationEvents
                .AnyAsync(e => e.Id == message.Id, context.CancellationToken))
        {
            logger.LogInformation(
                "Integration event already processed, skipping: {IntegrationEvent} {EventId}",
                message.GetType().Name, message.Id);
            return;
        }

        logger.LogInformation(
            "Integration Event handled: {IntegrationEvent} {EventId} with {ItemCount} item(s)",
            message.GetType().Name, message.Id, message.Items.Count);

        // Tracked here but not saved: CreateOrderHandler's SaveChangesAsync persists the order and
        // this marker in one transaction, so an order can never exist without its marker.
        dbContext.ProcessedIntegrationEvents.Add(new ProcessedIntegrationEvent
        {
            Id = message.Id,
            EventType = message.GetType().Name,
            ProcessedAt = DateTime.UtcNow
        });

        var command = MapToCreateOrderCommand(message);
        await sender.Send(command, context.CancellationToken);
    }

    private static CreateOrderCommand MapToCreateOrderCommand(BasketCheckoutEvent message)
    {
        // Create full order with incoming event data
        var addressDto = new AddressDto(message.FirstName, message.LastName, message.EmailAddress, message.AddressLine, message.Country, message.State, message.ZipCode);
        var paymentDto = new PaymentDto(message.CardName, message.CardNumber, message.Expiration, message.CVV, message.PaymentMethod);
        var orderId = Guid.NewGuid();

        // Prices arrive already discounted by Basket; they are used as-is.
        var orderItems = message.Items
            .Select(item => new OrderItemDto(orderId, item.ProductId, item.Quantity, item.Price, item.ProductName))
            .ToList();

        var orderDto = new OrderDto(
            Id: orderId,
            CustomerId: message.CustomerId,
            OrderName: message.UserName,
            ShippingAddress: addressDto,
            BillingAddress: addressDto,
            Payment: paymentDto,
            Status: Ordering.Domain.Enums.OrderStatus.Pending,
            OrderItems: orderItems);

        return new CreateOrderCommand(orderDto);
    }
}
