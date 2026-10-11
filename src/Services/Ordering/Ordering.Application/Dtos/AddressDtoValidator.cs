using FluentValidation;

namespace Ordering.Application.Dtos;

/// <summary>
/// Mirrors OrderConfiguration's column constraints exactly. Without this, an address field
/// longer than its column (e.g. a non-US postal code against the old 5-char ZipCode limit)
/// reached the database from inside the async BasketCheckoutEvent consumer, where a truncation
/// error crashes order creation with no clean error surfaced to the caller.
/// </summary>
public class AddressDtoValidator : AbstractValidator<AddressDto>
{
    public AddressDtoValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.EmailAddress).NotEmpty().MaximumLength(50).EmailAddress();
        RuleFor(x => x.AddressLine).NotEmpty().MaximumLength(180);
        RuleFor(x => x.Country).MaximumLength(50);
        RuleFor(x => x.State).MaximumLength(50);
        RuleFor(x => x.ZipCode).NotEmpty().MaximumLength(20);
    }
}
