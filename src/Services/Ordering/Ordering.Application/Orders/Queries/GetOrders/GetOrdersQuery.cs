using BuildingBlocks.CQRS;
using BuildingBlocks.Pagination;
using FluentValidation;

namespace Ordering.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery(PaginationRequest PaginationRequest)
    : IQuery<GetOrdersResult>;

public record GetOrdersResult(PaginatedResult<OrderDto> Orders);

// Same gap Catalog had: nothing previously stopped a caller requesting an unbounded PageSize.
public class GetOrdersQueryValidator : AbstractValidator<GetOrdersQuery>
{
    public GetOrdersQueryValidator()
    {
        RuleFor(x => x.PaginationRequest.PageIndex).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PaginationRequest.PageSize)
            .InclusiveBetween(1, PaginationDefaults.MaxPageSize)
            .WithMessage($"PageSize must be between 1 and {PaginationDefaults.MaxPageSize}.");
    }
}