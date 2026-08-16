using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Models;

namespace Ordering.Application.Data;

public interface IApplicationDbContext
{
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<ProcessedIntegrationEvent> ProcessedIntegrationEvents { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
