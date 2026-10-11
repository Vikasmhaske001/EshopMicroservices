using FluentValidation;

namespace Ordering.Application.Dtos;

/// <summary>Mirrors OrderConfiguration's column constraints for Payment - same reasoning as
/// AddressDtoValidator.</summary>
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
