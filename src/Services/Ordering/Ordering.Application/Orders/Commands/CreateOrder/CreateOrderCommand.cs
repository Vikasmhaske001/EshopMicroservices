using BuildingBlocks.CQRS;
using FluentValidation;
using Ordering.Application.Dtos;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand(OrderDto Order)
    : ICommand<CreateOrderResult>;

public record CreateOrderResult(Guid Id);

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Order.OrderName).NotEmpty().WithMessage("Name is required");
        RuleFor(x => x.Order.CustomerId).NotNull().WithMessage("CustomerId is required");
        RuleFor(x => x.Order.OrderItems).NotEmpty().WithMessage("OrderItems should not be empty");

        // Catches oversized/invalid address or payment fields here, as a clean 400, instead of
        // letting them reach the database from inside the async BasketCheckoutEvent consumer.
        RuleFor(x => x.Order.ShippingAddress).NotNull().SetValidator(new AddressDtoValidator());
        RuleFor(x => x.Order.BillingAddress).NotNull().SetValidator(new AddressDtoValidator());
        RuleFor(x => x.Order.Payment).NotNull().SetValidator(new PaymentDtoValidator());
    }
}