namespace Ordering.Infrastructure.Data.Extensions;

internal class InitialData
{
    public static IEnumerable<Order> OrdersWithItems
    {
        get
        {
            var address1 = Address.Of("vikas", "mhaske", "vikas@eshop.local", "Bahcelievler No:4", "India", "Maharashtra", "41100");
            var address2 = Address.Of("piyush", "kumar", "piyush@eshop.local", "Broadway No:1", "India", "Delhi", "11000");
            var address3 = Address.Of("sejal", "sharma", "sejal@eshop.local", "MG Road No:9", "India", "Karnataka", "56000");

            var payment1 = Payment.Of("vikas", "5555555555554444", "12/28", "355", 1);
            var payment2 = Payment.Of("piyush", "8885555555554444", "06/30", "222", 2);
            var payment3 = Payment.Of("sejal", "4111111111111111", "09/29", "123", 1);

            var order1 = Order.Create(
                            OrderId.Of(Guid.NewGuid()),
                            CustomerId.Of(new Guid("58c49479-ec65-4de2-86e7-033c546291aa")),
                            OrderName.Of("ORD_1"),
                            shippingAddress: address1,
                            billingAddress: address1,
                            payment1);
            order1.Add(ProductId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61")), 2, 500, "IPhone X");
            order1.Add(ProductId.Of(new Guid("c67d6323-e8b1-4bdf-9a75-b0d0d2e7e914")), 1, 400, "Samsung 10");

            var order2 = Order.Create(
                            OrderId.Of(Guid.NewGuid()),
                            CustomerId.Of(new Guid("189dc8dc-990f-48e0-a37b-e6f2b60b9d7d")),
                            OrderName.Of("ORD_2"),
                            shippingAddress: address2,
                            billingAddress: address2,
                            payment2);
            order2.Add(ProductId.Of(new Guid("4f136e9f-ff8c-4c1f-9a33-d12f689bdab8")), 1, 650, "Huawei Plus");
            order2.Add(ProductId.Of(new Guid("6ec1297b-ec0a-4aa1-be25-6726e3b51a27")), 2, 450, "Xiaomi Mi 9");

            var order3 = Order.Create(
                            OrderId.Of(Guid.NewGuid()),
                            CustomerId.Of(new Guid("a1b2c3d4-5e6f-4a1b-9c2d-3e4f5a6b7c8d")),
                            OrderName.Of("ORD_3"),
                            shippingAddress: address3,
                            billingAddress: address3,
                            payment3);
            order3.Add(ProductId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61")), 1, 500, "IPhone X");

            return new List<Order> { order1, order2, order3 };
        }
    }
}
