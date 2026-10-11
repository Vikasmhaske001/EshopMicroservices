import { expect, test } from '@playwright/test';

// Runs against the real backend (Docker stack), not a mock - this is the one true end-to-end
// check the plan calls for: anonymous browse -> login (via register) -> add to basket ->
// checkout -> see the order. A fresh username is used each run so re-running the test doesn't
// collide with a previous run's account or orders.
test('anonymous visitor can browse, register, add to basket, and check out', async ({ page }) => {
  const username = `e2e_${Date.now()}`;
  const password = 'E2eTest@123';

  await page.goto('/products');
  await expect(page.getByRole('link', { name: 'EShop home' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible();

  // Catalog is public - no login required to browse or open a product.
  // The product name link is stretched over the whole card, so clicking it opens the product.
  await page.locator('app-product-card h3 a').first().click();
  await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeVisible();

  // Adding to basket while anonymous must redirect to login, not fail silently or crash.
  await page.getByRole('button', { name: 'Add to Basket' }).click();
  await expect(page).toHaveURL(/\/login\?returnUrl=/);

  // Register a fresh account (register.html preserves returnUrl from the login page's link).
  await page.locator('main').getByRole('link', { name: 'Register' }).click();
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Email', { exact: true }).fill(`${username}@example.com`);
  // exact: the Show/Hide toggle is also labelled "Show password".
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.locator('main').getByRole('button', { name: 'Create account' }).click();

  // Registering logs the user in and honors returnUrl - should land back on the product page.
  await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeVisible();

  await page.getByRole('button', { name: 'Add to Basket' }).click();
  await expect(page.getByText(/Added .* to your basket/)).toBeVisible();

  await page.goto('/checkout');
  await page.getByLabel('First name').fill('Playwright');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Address', { exact: true }).fill('1 Test Street');
  await page.getByLabel('Country').fill('Testland');
  await page.getByLabel('State').fill('TS');
  await page.getByLabel('PIN code').fill('411001');
  await page.getByLabel('Name on card').fill('E2E Tester');
  await page.getByLabel('Card number').fill('4111111111111111');
  await page.getByLabel('Expiration (MM/YY)').fill('12/30');
  await page.getByLabel('CVV').fill('123');

  await page.getByRole('button', { name: 'Place Order' }).click();

  // Checkout is async (RabbitMQ) - the app polls for the new order, so this can take a few seconds.
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+/, { timeout: 25000 });
  await expect(page.getByRole('heading', { level: 1, name: /^Order / })).toBeVisible();
  // A new order starts as Pending; the status is shown as a pill next to the title.
  await expect(page.locator('app-status-badge').first()).toHaveText('Pending');
  // The customer name appears in both the shipping and payment sections - the address line is
  // unambiguous. The 6-digit PIN also proves the widened ZipCode column end to end.
  await expect(page.getByText('1 Test Street')).toBeVisible();
  await expect(page.getByText(/411001/)).toBeVisible();
});
