using Catalog.Api.Models;
using JasperFx.CodeGeneration.Frames;
using Microsoft.Extensions.Logging;
using System.Threading;

namespace Catalog.Api.Products.GetProducts
{
    public record GetProductsQuery(): IQuery<GetProductsResult>;
    public record GetProductsResult(IEnumerable<Product> Products);
    internal class GetProductsQueryHandler(IDocumentSession session)
        :IQueryHandler<GetProductsQuery ,GetProductsResult>
    {
        public async Task<GetProductsResult> Handle (GetProductsQuery query, CancellationToken cancellationToken)
        {
            //logger.LogInformation(
            //   "GetProductsQueryHandler.Handle called with {@Query}",
            //   query);

            var products = await session.Query<Product>()
            .ToListAsync(cancellationToken);

            return new GetProductsResult(products);
        }
        
    }
}
