using System.Security.Claims;
using BuildingBlocks.Auth;

namespace Basket.API.Basket.StoreBasket;
public record StoreBasketRequest(ShoppingCart Cart);
public record StoreBasketResponse(string UserName);

public class StoreBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/basket", async (StoreBasketRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            // Whatever UserName the client sent is overwritten with the caller's own identity -
            // there is no way to store a basket on someone else's behalf.
            request.Cart.UserName = user.GetUserName();

            var command = request.Adapt<StoreBasketCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<StoreBasketResponse>();

            return Results.Created("/basket", response);
        })
        .RequireAuthorization()
        .WithName("StoreBasket")
        .Produces<StoreBasketResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Store Basket")
        .WithDescription("Create or replace the authenticated user's basket");
    }
}
