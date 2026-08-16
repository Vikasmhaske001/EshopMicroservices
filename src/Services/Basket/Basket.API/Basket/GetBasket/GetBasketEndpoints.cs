using System.Security.Claims;
using Basket.API.Basket;

namespace Basket.API.Basket.GetBasket;
//public record GetBasketRequest(string UserName);
public record GetBasketResponse(ShoppingCart Cart);

public class GetBasketEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/basket/{userName}", async (string userName, ClaimsPrincipal user, ISender sender) =>
        {
            BasketOwnership.EnsureOwnerOrAdmin(user, userName);

            var result = await sender.Send(new GetBasketQuery(userName));

            var respose = result.Adapt<GetBasketResponse>();

            return Results.Ok(respose);
        })
        .RequireAuthorization()
        .WithName("GetProductById")
        .Produces<GetBasketResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Product By Id")
        .WithDescription("Get Product By Id");
    }
}
