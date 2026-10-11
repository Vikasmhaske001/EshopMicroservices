using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Data;

public static class Extentions
{
    public static async Task<IApplicationBuilder> UseMigrationAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();

        // The scope owns the DbContext, so it is not disposed here.
        var dbContext = scope.ServiceProvider.GetRequiredService<DiscountContext>();

        // Awaited so the app only starts serving once the schema is ready.
        await dbContext.Database.MigrateAsync();

        return app;
    }
}
