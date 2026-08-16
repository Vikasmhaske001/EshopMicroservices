using BuildingBlocks.Pagination;

namespace Catalog.Api.Products.GetProducts
{
    public record GetProductsRequest(
        int PageNumber = 1,
        int PageSize = PaginationDefaults.DefaultPageSize,
        string? Category = null,
        string? Search = null,
        string? SortBy = null,
        string? SortDirection = null);

    public record GetProductsResponse(PaginatedResult<Product> Products);

    public class GetProductsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/products", async ([AsParameters] GetProductsRequest request, ISender sender) =>
            {
                var query = request.Adapt<GetProductsQuery>();
                var result = await sender.Send(query);
                var response = result.Adapt<GetProductsResponse>();
                return Results.Ok(response);
            })

        .WithName("GetProducts")
        .Produces<GetProductsResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Products")
        .WithDescription("Paginated product listing. Supports category/search filters and name/price sorting.");

        }
    }
}
