using System.Security.Claims;
using Basket.API.Basket;

namespace Basket.API.Basket.DeleteBasket;

//public record DeleteBasketRequest(string UserName);
public record DeleteBasketResponse(bool IsSuccess);

public class DeleteBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/basket/{userName}", async (string userName, ClaimsPrincipal user, ISender sender) =>
        {
            BasketOwnership.EnsureOwnerOrAdmin(user, userName);

            var result = await sender.Send(new DeleteBasketCommand(userName));

            var response = result.Adapt<DeleteBasketResponse>();

            return Results.Ok(response);
        })
        .RequireAuthorization()
        .WithName("DeleteProduct")
        .Produces<DeleteBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Delete Product")
        .WithDescription("Delete Product");
    }
}

