import { expect, test } from '@playwright/test';

// Runs against the real backend (Docker stack), not a mock - this is the one true end-to-end
// check the plan calls for: anonymous browse -> login (via register) -> add to basket ->
// checkout -> see the order. A fresh username is used each run so re-running the test doesn't
// collide with a previous run's account or orders.
test('anonymous visitor can browse, register, add to basket, and check out', async ({ page }) => {
  const username = `e2e_${Date.now()}`;
  const password = 'E2eTest@123';

  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'EShop' })).toBeVisible();

  // Catalog is public - no login required to browse or open a product.
  await page.getByRole('link', { name: 'View Details' }).first().click();
  await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeVisible();

  // Adding to basket while anonymous must redirect to login, not fail silently or crash.
  await page.getByRole('button', { name: 'Add to Basket' }).click();
  await expect(page).toHaveURL(/\/login\?returnUrl=/);

  // Register a fresh account (register.html preserves returnUrl from the login page's link).
  await page.locator('main').getByRole('link', { name: 'Register' }).click();
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(`${username}@example.com`);
  await page.getByLabel('Password').fill(password);
  await page.locator('main').getByRole('button', { name: 'Register' }).click();

  // Registering logs the user in and honors returnUrl - should land back on the product page.
  await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeVisible();

  await page.getByRole('button', { name: 'Add to Basket' }).click();
  await expect(page.getByText(/Added .* to your basket/)).toBeVisible();

  await page.goto('/checkout');
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Address').fill('1 Test Street');
  await page.getByLabel('Country').fill('Testland');
  await page.getByLabel('State').fill('TS');
  // Stays within Ordering's ZipCode column limit (max 5 chars) - a 6+ digit code currently
  // crashes the async order-creation consumer server-side (a real backend bug, out of scope here).
  await page.getByLabel('Zip code').fill('12345');
  await page.getByLabel('Name on card').fill('E2E Tester');
  await page.getByLabel('Card number').fill('4111111111111111');
  await page.getByLabel('Expiration (MM/YY)').fill('12/30');
  await page.getByLabel('CVV').fill('123');

  await page.getByRole('button', { name: 'Place Order' }).click();

  // Checkout is async (RabbitMQ) - the app polls for the new order, so this can take a few seconds.
  await expect(page).toHaveURL(/\/orders\/[0-9a-f-]+/, { timeout: 25000 });
  await expect(page.getByRole('heading', { name: /^Order / })).toBeVisible();
  await expect(page.getByText('Status:')).toBeVisible();
  // "E2E Tester" appears in both the shipping and payment sections (first/last name and card
  // name were filled with the same value) - the address line is unambiguous.
  await expect(page.getByText('1 Test Street')).toBeVisible();
});
