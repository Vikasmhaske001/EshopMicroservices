using System.Security.Claims;
using BuildingBlocks.Auth;

namespace Basket.API.Basket.DeleteBasket;

public record DeleteBasketResponse(bool IsSuccess);

public class DeleteBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/basket", async (ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new DeleteBasketCommand(user.GetUserName()));

            var response = result.Adapt<DeleteBasketResponse>();

            return Results.Ok(response);
        })
        .RequireAuthorization()
        .WithName("DeleteBasket")
        .Produces<DeleteBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Delete Basket")
        .WithDescription("Delete the authenticated user's basket");
    }
}
