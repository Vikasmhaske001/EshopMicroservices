using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Data;

public static class Extentions
{
    public static async Task<IApplicationBuilder> UseMigrationAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<DiscountContext>();

        await dbContext.Database.MigrateAsync();

        return app;
    }
}
