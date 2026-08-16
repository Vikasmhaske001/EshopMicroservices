using System.Security.Claims;
using BuildingBlocks.Auth;
using Carter;
using MediatR;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Queries.GetOrdersByName;

namespace Ordering.API.Endpoints;

//- Accepts a name parameter.
//- Constructs a GetOrdersByNameQuery.
//- Retrieves and returns matching orders.

//public record GetOrdersByNameRequest(string Name);
public record GetOrdersByNameResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByName : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/{orderName}", async (string orderName, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetOrdersByNameQuery(orderName));

            var response = result.Adapt<GetOrdersByNameResponse>();

            // orderName isn't a per-customer key, so rather than an all-or-nothing 403, a
            // non-admin caller simply never sees orders they don't own.
            if (!user.IsAdmin())
            {
                var callerId = user.GetUserId();
                response = response with { Orders = response.Orders.Where(o => o.CustomerId == callerId) };
            }

            return Results.Ok(response);
        })
        .RequireAuthorization()
        .WithName("GetOrdersByName")
        .Produces<GetOrdersByNameResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Get Orders By Name")
        .WithDescription("Get Orders By Name");
    }
}
