using System.Security.Claims;
using Basket.API.Basket;
using Basket.API.Dtos;

namespace Basket.API.Basket.CheckoutBasket;

public record CheckoutBasketRequest(BasketCheckoutDto BasketCheckoutDto);
public record CheckoutBasketResponse(bool IsSuccess);

public class CheckoutBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/basket/checkout", async (CheckoutBasketRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            BasketOwnership.EnsureOwnerOrAdmin(user, request.BasketCheckoutDto.UserName);
            BasketOwnership.EnsureOwnerOrAdmin(user, request.BasketCheckoutDto.CustomerId);

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
