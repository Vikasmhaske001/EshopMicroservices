using System.Security.Claims;
using BuildingBlocks.Auth;

namespace Basket.API.Basket.GetBasket;
public record GetBasketResponse(ShoppingCart Cart);

public class GetBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // No route parameter: the basket touched is always the caller's own, derived from the
        // JWT rather than a client-suppliable value.
        app.MapGet("/basket", async (ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetBasketQuery(user.GetUserName()));

            var respose = result.Adapt<GetBasketResponse>();

            return Results.Ok(respose);
        })
        .RequireAuthorization()
        .WithName("GetBasket")
        .Produces<GetBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Basket")
        .WithDescription("Get the authenticated user's basket");
    }
}
