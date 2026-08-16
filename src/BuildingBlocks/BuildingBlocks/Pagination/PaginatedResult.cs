namespace BuildingBlocks.Pagination;

public class PaginatedResult<TEntity>
    (int pageIndex, int pageSize, long count, IEnumerable<TEntity> data)
    where TEntity : class
{
    public int PageIndex { get; } = pageIndex;
    public int PageSize { get; } = pageSize;
    public long Count { get; } = count;
    public IEnumerable<TEntity> Data { get; } = data;

    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(Count / (double)PageSize);
}

/// <summary>Shared page-size bounds so the limit isn't duplicated per query/validator.</summary>
public static class PaginationDefaults
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 50;
}
