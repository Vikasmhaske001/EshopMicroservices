using FluentValidation;

namespace Ordering.Application.Dtos;

public class PaymentDtoValidator : AbstractValidator<PaymentDto>
{
    public PaymentDtoValidator()
    {
        RuleFor(x => x.CardName).MaximumLength(50);
        RuleFor(x => x.CardNumber).NotEmpty().MaximumLength(24);
        RuleFor(x => x.Expiration).MaximumLength(10);
        RuleFor(x => x.Cvv).MaximumLength(3);
    }
}
