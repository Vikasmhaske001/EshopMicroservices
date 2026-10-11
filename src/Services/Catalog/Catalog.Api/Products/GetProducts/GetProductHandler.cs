using BuildingBlocks.Pagination;
using Catalog.Api.Models;
using FluentValidation;
using Marten.Pagination;

namespace Catalog.Api.Products.GetProducts
{
    public record GetProductsQuery(
        int PageNumber = 1,
        int PageSize = PaginationDefaults.DefaultPageSize,
        string? Category = null,
        string? Search = null,
        string? SortBy = null,
        string? SortDirection = null)
        : IQuery<GetProductsResult>;

    public record GetProductsResult(PaginatedResult<Product> Products);

    public class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
    {
        private static readonly string[] AllowedSortFields = ["name", "price"];
        private static readonly string[] AllowedSortDirections = ["asc", "desc"];

        public GetProductsQueryValidator()
        {
            RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, PaginationDefaults.MaxPageSize)
                .WithMessage($"PageSize must be between 1 and {PaginationDefaults.MaxPageSize}.");

            // Whitelisted rather than accepting any client-supplied property name, which would
            // otherwise need to be reflected onto the query - a source of both bugs and injection risk.
            RuleFor(x => x.SortBy)
                .Must(s => string.IsNullOrEmpty(s) || AllowedSortFields.Contains(s.ToLowerInvariant()))
                .WithMessage($"sortBy must be one of: {string.Join(", ", AllowedSortFields)}.");

            RuleFor(x => x.SortDirection)
                .Must(s => string.IsNullOrEmpty(s) || AllowedSortDirections.Contains(s.ToLowerInvariant()))
                .WithMessage("sortDirection must be 'asc' or 'desc'.");
        }
    }

    internal class GetProductsQueryHandler(IDocumentSession session)
        : IQueryHandler<GetProductsQuery, GetProductsResult>
    {
        public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
        {
            var products = session.Query<Product>();

            IQueryable<Product> filtered = products;

            if (!string.IsNullOrWhiteSpace(query.Category))
            {
                filtered = filtered.Where(p => p.Categories.Contains(query.Category));
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                filtered = filtered.Where(p => p.Name.Contains(query.Search, StringComparison.OrdinalIgnoreCase));
            }

            // Deterministic ordering is required for stable pagination - without it, Postgres is
            // free to return rows in a different order across pages/requests.
            var sortBy = query.SortBy?.ToLowerInvariant();
            var descending = string.Equals(query.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

            filtered = (sortBy, descending) switch
            {
                ("price", true) => filtered.OrderByDescending(p => p.Price),
                ("price", false) => filtered.OrderBy(p => p.Price),
                (_, true) => filtered.OrderByDescending(p => p.Name),
                _ => filtered.OrderBy(p => p.Name)
            };

            // Database-side pagination: Marten translates this to a COUNT + LIMIT/OFFSET query
            // rather than loading every matching row and paging in memory.
            IPagedList<Product> pagedProducts =
                await filtered.ToPagedListAsync(query.PageNumber, query.PageSize, cancellationToken);

            var result = new PaginatedResult<Product>(
                (int)pagedProducts.PageNumber,
                (int)pagedProducts.PageSize,
                pagedProducts.TotalItemCount,
                pagedProducts);

            return new GetProductsResult(result);
        }
    }
}
