using System.Runtime.InteropServices;

namespace Catalog.Api.Products.CreateProduct
{
    public record CreateProductCommand(string Name, List<string> Categories, string Description, string ImageFile, decimal Price)
        : ICommand<CreateProductResult>;
    public record CreateProductResult(Guid Id);

    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Product name is required.");
            RuleFor(x => x.Categories).NotEmpty().WithMessage("At least one category is required.");
            RuleFor(x => x.Description).NotEmpty().WithMessage("Product description is required.");
            RuleFor(x => x.ImageFile).NotEmpty().WithMessage("Image file is required.");
            RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than zero.");
        }
    }

    internal class CreateProductCommandHandler (IDocumentSession documentSession) : ICommandHandler<CreateProductCommand, CreateProductResult>
    {
        public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
        {
            //business logic to create a product and return the result
            //save the database
            //return the CreateProductResult result
     
            //var result = await validator.ValidateAsync(command, cancellationToken);
            //var errors = result.Errors.Select(e => e.ErrorMessage).ToList();
            //if (errors.Any())
            //{
            //    throw new ValidationException(errors.FirstOrDefault());
            //}


                var product =new Product
            {
                Name=command.Name,
                Categories= command.Categories,
                Description=command.Description,
                ImageFile=command.ImageFile,
                Price=command.Price

            };

            //save the product to the database

            documentSession.Store(product);
            await documentSession.SaveChangesAsync(cancellationToken);

            return new CreateProductResult(product.Id);

          
        }
    }

}
