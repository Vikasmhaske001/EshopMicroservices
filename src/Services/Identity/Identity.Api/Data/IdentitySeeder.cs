using BuildingBlocks.Auth;
using Microsoft.AspNetCore.Identity;

namespace Identity.Api.Data;

/// <summary>
/// Seeds roles and three demo Customer accounts. Their ids intentionally match the CustomerIds
/// already seeded in Ordering's database (see Ordering.Infrastructure InitialData) so the demo
/// accounts can check out and view orders against real, pre-existing seed data without any extra
/// setup. A self-registered user gets a fresh id and currently has no matching row in
/// Ordering.Customers - see the "Remaining Issues" note in the Step 5 report.
/// </summary>
public static class IdentitySeeder
{
    public static readonly Guid VikasId = Guid.Parse("58c49479-ec65-4de2-86e7-033c546291aa");
    public static readonly Guid PiyushId = Guid.Parse("189dc8dc-990f-48e0-a37b-e6f2b60b9d7d");
    public static readonly Guid SejalId = Guid.Parse("a1b2c3d4-5e6f-4a1b-9c2d-3e4f5a6b7c8d");

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        foreach (var role in new[] { AppRoles.Admin, AppRoles.Customer })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        await EnsureUserAsync(userManager, VikasId, "vikas", "vikas@eshop.local", "Customer@123", AppRoles.Customer);
        await EnsureUserAsync(userManager, PiyushId, "piyush", "piyush@eshop.local", "Customer@123", AppRoles.Customer);
        await EnsureUserAsync(userManager, SejalId, "sejal", "sejal@eshop.local", "Customer@123", AppRoles.Customer);
        await EnsureUserAsync(userManager, Guid.NewGuid(), "micheal", "micheal@eshop.local", "Admin@12345", AppRoles.Admin);
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager, Guid id, string userName, string email, string password, string role)
    {
        if (await userManager.FindByNameAsync(userName) is not null)
        {
            return;
        }

        var user = new ApplicationUser
        {
            Id = id,
            UserName = userName,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }
}
