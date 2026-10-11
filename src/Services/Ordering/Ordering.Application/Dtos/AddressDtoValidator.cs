using FluentValidation;

namespace Ordering.Application.Dtos;

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
