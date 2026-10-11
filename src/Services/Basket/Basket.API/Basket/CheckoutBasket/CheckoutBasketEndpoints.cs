using System.Security.Claims;
using Basket.API.Dtos;
using BuildingBlocks.Auth;
using BuildingBlocks.Exceptions;

namespace Basket.API.Basket.CheckoutBasket;

public record CheckoutBasketRequest(BasketCheckoutDto BasketCheckoutDto);
public record CheckoutBasketResponse(bool IsSuccess);

public class CheckoutBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/basket/checkout", async (CheckoutBasketRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            // A null body previously reached the field assignment below before any validator ran,
            // producing a 500 NullReferenceException instead of a 400 for malformed input.
            if (request.BasketCheckoutDto is null)
            {
                throw new BadRequestException("BasketCheckoutDto is required.");
            }

            // UserName and CustomerId are always the caller's own - overwritten server-side so
            // the client cannot check out under someone else's identity by editing the request.
            request.BasketCheckoutDto.UserName = user.GetUserName();
            request.BasketCheckoutDto.CustomerId = user.GetUserId();

            var command = request.Adapt<CheckoutBasketCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<CheckoutBasketResponse>();

            return Results.Ok(response);
        })
        .RequireAuthorization()
        .WithName("CheckoutBasket")
        .Produces<CheckoutBasketResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Checkout Basket")
        .WithDescription("Checkout Basket");
    }
}
