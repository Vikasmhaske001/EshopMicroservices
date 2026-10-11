# Handoff: EShop UI Redesign — Concept 1d "Refined EShop Signature" (Mango & Grape)

## Overview
This is a redesign of the EShopMicroservices Angular frontend (`frontend/eshop-angular`). It covers these screens: the shared header, Discover (the product list), Product details, Basket, Checkout and Sign in.

**Concept 1d is the version to implement in the main app.** It must match the HTML reference exactly. Concepts 1a, 1b and 1c are in the same file for comparison only. Do not implement them unless you are asked to.

## About the Design Files
The files in this bundle are **design references built in HTML**. They are prototypes that show the intended look and behaviour; they are not production code to paste in. Your task is to **recreate the 1d design in the existing Angular 21 + Angular Material 21 app**, using its patterns: standalone components, signals, reactive forms and the existing services.

How to open the reference: serve this folder over a local web server (for example `npx serve .`) and open `EShop Redesign Concepts.dc.html` in a browser. The 1d column is the right-most one, labelled "1d · Refined EShop Signature · Recommended".

## Fidelity
**High-fidelity.** Recreate it pixel-perfectly: the exact hex values, font, sizes, radii, spacing and copy listed below. Material components may be used underneath, but you must restyle them to match. That means no Material ripple or elevation look, and no M3 azure colours.

## Hard constraints (do not break)
- Do not change any API contracts, services, guards, interceptors or routes: `CatalogService`, `BasketService`, `CheckoutService`, `OrdersService`, `AuthService`, and `app.routes.ts`.
- Keep all existing behaviour:
  - Query-param state on `/products` (page, category, search, sortBy, sortDirection).
  - 300 ms search debounce.
  - `PAGE_SIZE = 9` with `PaginationControl`.
  - An unauthenticated user who clicks "Add to basket" is redirected to `/login?returnUrl=…`.
  - Checkout polls for the new order and then navigates to `/orders/:id`.
  - The existing validators and error messages.
- Payment stays **demo-only**. Never add real payment processing.
- **Product images.** The backend only stores `imageFile` (`product-1.png` … `product-6.png`) and has no static-file endpoint. Do NOT invent image URLs. Build a reusable `ProductImage` component:
  - If a real URL becomes available later (for example a future `IMAGE_BASE_URL` plus `imageFile`), render an `<img>`, with an `onerror` fallback to the tile below.
  - Otherwise, render the **category illustration tile** (see Assets).
- Prices: the current app formats prices in INR (₹, `en-IN` grouping, no decimals; the screenshots show "₹31,999"). Use `CurrencyPipe` with `'INR':'symbol':'1.0-0':'en-IN'` everywhere.
- Show only data the backend actually supplies. There is no shipping cost, rating, stock or wishlist. Show a discount row only if an item has `discountAmount > 0`.

## Design Tokens

### Colours
| Token | Hex | Use |
|---|---|---|
| `--es-ink` | `#1d1230` | Primary text, icons |
| `--es-text-2` | `#3d3550` | Body copy, field labels |
| `--es-muted` | `#57506a` | Secondary text |
| `--es-subtle` | `#8a8296` | Counts, placeholders, search icon |
| `--es-grape` | `#4b2a99` | Brand: logo tile, category labels, links, active chip, step badges, avatar |
| `--es-grape-soft` | `#f1ecff` | Selected chip and nav background, success toast, in-basket button |
| `--es-grape-border` | `#d9ccf7` | In-basket button border |
| `--es-grape-ring` | `#ece4ff` | Focus ring (4px) |
| `--es-grape-tint` | `#e5dcfb` | Text on a grape background |
| `--es-mango` | `#ffb703` | **Primary action**: all CTAs, basket badge, logo "E" letter |
| `--es-mango-hover` | `#f5a300` | CTA hover |
| `--es-mango-soft` | `#fff4dc` | Product image tile background, demo-payment notice |
| `--es-bg` | `#fffdf8` | Page background (warm white) |
| `--es-surface` | `#ffffff` | Cards, header |
| `--es-input-bg` | `#fffdf8` | Input background (white when focused) |
| `--es-line` | `#efe6d4` | Card borders |
| `--es-line-2` | `#f0e8d8` | Header bottom border, dividers |
| `--es-line-3` | `#e6dcc8` | Chips, stepper, select borders |
| `--es-input-border` | `#e0d6c2` | Input border |
| `--es-row-line` | `#f4ede0` | Basket row separator |
| `--es-table-head` | `#fffaf0` | Basket table header background |
| `--es-error` | `#b42318` | Field error text |
| `--es-error-ring` | `#d92d20` | Invalid input ring: `box-shadow: 0 0 0 2px` |
| `--es-error-bg` | `#fff6f5` | Error banner background |
| `--es-error-border` | `#f4c7c1` | Error banner border |
| `--es-error-ink` | `#7a1610` | Error banner text |
| `--es-notice-ink` | `#3d2a00` | Text on the mango-soft notice |

Contrast rule: text on mango is always `#1d1230`, never white.

### Typography
- Font: **Plus Jakarta Sans** (Google Fonts, weights 400/500/600/700/800). It replaces Roboto.
- Scale:
  - Page H1: 52px / 800 / letter-spacing -0.035em. Use 44px for Basket and Checkout.
  - Product title: 52px / 800 / line-height 1.02 / -0.035em.
  - Product price: 36px / 800 / -0.02em.
  - Summary total: 30px / 800 / -0.02em.
  - Card section title: 19px / 800. Summary title: 18px / 800.
  - Card name: 17px / 700. Card price: 21px / 800 / -0.01em.
  - Body: 17px / 1.65 for the product description; 15px elsewhere.
  - Labels: 13.5px / 700. Category eyebrow: 11.5px / 700 / letter-spacing 0.08em / uppercase / grape.
  - Errors: 12.5px / 600.

### Radii
| Element | Radius |
|---|---|
| Product card | 18px |
| Large cards (basket list, summary, checkout sections, empty states, sign-in card) | 20px |
| Product image (details) and sign-in shell | 24px |
| Buttons, steppers | 14px |
| Inputs, chips, small buttons, header icon button | 12px |
| Thumbnails | 14px (basket), 10px (summary) |
| Badge and category pill | 99px |

### Shadows
- Card hover: `0 18px 36px -20px rgba(29,18,48,.35)` plus `translateY(-3px)`, with a `.2s` transition on box-shadow and transform.
- Summary card: `0 18px 36px -28px rgba(29,18,48,.35)`.
- Sign-in card: `0 30px 60px -40px rgba(29,18,48,.4)`.
- Nothing else has a shadow.

### Layout
- Content max-width is **1296px**, centred, with 48px horizontal padding.
- Header is full width and 76px tall.
- Spacing steps used: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 48, 56, 72.

## Screens / Views (Concept 1d)

### Shared header (`app.html`)
- White, height 76px, `border-bottom: 1px solid #f0e8d8`, padding 0 48px. Flex row with gap 28px.
- **Logo**: a 36×36 tile, radius 10, background `#4b2a99`, containing the letter "E" (18px / 800 / `#ffb703`). Next to it, the word "EShop" at 22px / 800 / -0.02em.
- **Nav**: "Shop" is active, with background `#f1ecff`, colour `#4b2a99` and radius 10. "My orders" is inactive, colour `#57506a`; on hover its background becomes `#faf6ee`. Both are 15px / 600 with padding 8px 14px. Add "Admin" only for users with the Admin role, styled like "My orders".
- **Search** (margin-left auto): 380×44, border `1px solid #ebe2d0`, radius 12, background `#fffcf6`, magnifier icon in `#8a8296`, placeholder "Search products". It binds to the product-list `searchControl`. Typing on other routes should navigate to `/products?search=…`.
- **Signed in**:
  - Basket icon button: 44×44, border `#ebe2d0`, radius 12. On hover, background `#fff4dc` and border `#ffd166`.
  - Badge: shown only when `itemCount() > 0`. Position top -7 / right -7, minimum 20×20, background `#ffb703`, text `#1d1230` at 11px / 800, `2px solid #fff` border.
  - Avatar: a 36px grape circle with the user's initial in white, followed by the userName (14px / 600).
  - Keep "Log out" as a menu item on the avatar.
  - `aria-label` = "Basket, N items".
- **Signed out**: "Log in" as a text link (15px / 600), and "Create account" as a mango button (padding 12px 18px, radius 12).

### Discover (`product-list`)
- Padding 48px top, 72px bottom. Vertical gap of 28px between blocks.
- **Head row** (space-between, items aligned to the end):
  - Left: "Discover" in H1 52px, with the subtitle "Fresh picks, great prices. Phones, cameras and home essentials." (17px, `#57506a`).
  - Right: "{shown} of {total} products" (14px, muted).
- **Toolbar**: padding-bottom 20px, border-bottom `#f0e8d8`, gap 10px.
  - Category chips: "All" plus each category, each with its count. Height 40, padding 0 16, radius 12, 14px.
  - Inactive chip: border `1px #e6dcc8`, white background, text `#3d3550` at weight 600, count in `#8a8296`. On hover, border and text turn grape.
  - Active chip: border `1.5px #4b2a99`, background `#f1ecff`, text `#4b2a99` at weight 700, `aria-pressed="true"`.
  - Sort select on the right, labelled "Sort by". Height 40, radius 12, border `#e6dcc8`, 14px / 600. Options: Name (A–Z), Name (Z–A), Price: low to high, Price: high to low.
- **Grid**: 4 columns, gap 24. Card:
  - White, border `#efe6d4`, radius 18, overflow hidden, hover as in Shadows.
  - Image is a 1:1 tile with background `#fff4dc`; clicking it goes to details.
  - Body has padding 16px 18px 18px and a gap of 6. It contains:
    - The eyebrow category in grape.
    - The name (17px / 700), which links to details and turns grape on hover.
    - A row with the price (21px / 800) and a button:
      - "Add" when the item is not in the basket: mango, height 40, padding 0 16, radius 12, 14px / 700.
      - "✓ In basket · N" when it is: background `#f1ecff`, border `#d9ccf7`, text grape. Clicking adds one more.
- Pagination stays below the grid. Style the current page as a grape square and the other pages as text.
- **Loading**: 8 skeleton cards. Tile `#fbf3e2`, lines `#f3ead8` (10/16/22px tall at 40/70/45% width, radius 4).
- **Empty**:
  - Container: padding 72, white, `1px dashed #e6dcc8`, radius 18, centred.
  - Icon: a 56px tile with radius 16, background `#f1ecff`, and a "?" in grape.
  - Copy: "No products match your filters" (24px / 800), then "Try a different category, or clear your search."
  - Button: mango "Clear filters", which resets category and search.
- **Error**: a banner with background `#fff6f5`, border `#f4c7c1`, radius 18, padding 24px 28px.
  - Copy: "We couldn't load products" (18px / 800, `#7a1610`), then "The catalog service didn't respond. Your basket is unaffected."
  - Button: an outline "Try again" in `#7a1610`, which re-runs the query.

### Product details (`product-detail`)
- Padding 32px top, 72px bottom. A "← Back to products" link at the top (14px / 700 / grape).
- Two equal columns with a gap of 56.
- **Left**: a 1:1 image with radius 24, border `#efe6d4`, background `#fff4dc`.
- **Right** (padding-top 12, gap 22):
  - A category pill: background `#f1ecff`, grape text at 12.5px / 700, 0.06em, uppercase.
  - Title at 52px.
  - Price at 36px.
  - Description at 17px / 1.65, colour `#3d3550`, max-width 520.
  - A 1px divider in `#f0e8d8`.
  - **Quantity stepper**: height 56, border `#e6dcc8`, radius 14, white. The − and + buttons are 52 wide; on hover their background is `#faf6ee`. The value is 17px / 700, 40 wide. Use `role="group"` with `aria-label="Quantity"`; the minimum is 1.
  - **Add button**: mango, flex 1, max-width 340, height 56, radius 14, 16px / 800. Label: "Add to basket · {price × qty}". While the request is in flight, disable it and show "Adding…".
  - **Success toast**: shown inline under the button for 4 seconds. Background `#f1ecff`, text `#2e1a66`, radius 14, padding 14px 16px. It shows a 24px grape check circle, then "Added {name} to your basket", then a "View basket" link (800). This replaces the MatSnackBar, or style the snackbar to look like this.
- **"More in {category}"**:
  - Data comes from `CatalogService.getProductsByCategory`, excluding the current product. Hide the section if the result is empty.
  - Layout: 4 columns, gap 20. Each card is a row: a 72px thumbnail with radius 12, then the name (700) and price (800). Padding 12, border `#efe6d4`, radius 16; on hover the border turns grape.

### Basket (`basket-page`, `basket-item`)
- Heading: "Your basket" at 44px, followed by a count pill "N items" (background `#f1ecff`, grape, 14px / 700).
- Two columns: `1fr` and `380px`, gap 32, aligned to the top.
- **List card**: white, border `#efe6d4`, radius 20.
  - Header row: background `#fffaf0`, 12px / 700 / 0.08em, colour `#57506a`. Columns: PRODUCT | UNIT PRICE | QUANTITY | TOTAL | (blank).
  - Grid template: `1fr 120px 150px 130px 56px`, gap 16, padding 18px 24px, rows separated by `#f4ede0`.
  - Product cell: an 80×80 thumbnail with radius 14, then the name (16px / 700) and the category eyebrow.
  - Stepper: height 44, radius 12, buttons 42 wide. Line total: 17px / 800, right-aligned.
  - Remove button: 44×44 "×", colour `#57506a`. On hover: background `#fff6f5`, border `#f4c7c1`, colour `#b42318`. `aria-label` = "Remove {name}".
  - Footer: "← Continue shopping" (a grape link) and "Clear basket" (muted; turns red on hover).
- **Summary card**: sticky with top 24, padding 24, radius 20, with the summary shadow. Contents:
  - "Order summary".
  - "Subtotal (N items)" with its value.
  - A dashed top border, then "Total" with the value at 30px / 800.
  - A mango "Proceed to checkout" button, height 56.
  - The note "Payment is demo-only. Nothing is charged." (12.5px, centred).
- **Empty state**:
  - A card with padding 72, laid out as a grid of `200px 1fr`.
  - Left: the kitchen illustration on `#f1ecff`.
  - Right: "Your basket is empty" (32px / 800), then "Browse fresh picks and add what you love. It'll wait here for you.", then a mango "Browse products" button that goes to `/products`.
- Keep the progress-bar loading behaviour, restyled in grape.

### Checkout (`checkout-form`)
- **Heading row**: "Checkout" at 44px, with a progress indicator on the right (an `<ol>`):
  1. Basket: a 26px grape circle with a ✓.
  2. A 32×2 connector in grape.
  3. Details: a 26px mango circle with "2". This is the current step.
  4. A connector in `#e6dcc8`.
  5. Order placed: an outline circle with "3", colour `#8a8296`.
- Two columns: `1fr` and `380px`, gap 32.
- **Section cards** (white, border `#efe6d4`, radius 20, padding 28, gap 16). Each has a numbered 30px grape circle and a 19px / 800 title.
  1. **"Shipping & billing address"**: field rows are [First name | Last name], [Email], [Address], [Country | State | PIN code], with a gap of 16.
  2. **"Payment"**:
     - First, a notice with background `#fff4dc`, text `#3d2a00`, radius 12, padding 12px 14px: "**Demo only.** No real payment is processed. Any values in a valid format will work."
     - Then the rows [Name on card] and [Card number (placeholder 4111111111111111) | Expiration (MM/YY) (placeholder 12/28) | CVV].
- **Field**:
  - Label above the input (13.5px / 700, `#3d3550`, gap 6).
  - Input: height 48, border `#e0d6c2`, radius 12, padding 0 14, 15px, background `#fffdf8`.
  - Focus: border grape, white background, ring `0 0 0 4px #ece4ff`.
  - Invalid and touched: ring `0 0 0 2px #d92d20`, with an error line below (12.5px / 600, `#b42318`).
  - Messages (keep these from the existing code):
    - "Enter a valid email address."
    - "Enter 13-19 digits, no spaces."
    - "Use MM/YY format."
    - "3 or 4 digits."
    - Required: "{Label} is required."
  - Replace `mat-form-field appearance="outline"` with this style, either through a custom field component or by overriding the Material tokens.
- **Summary card** (sticky):
  - Item rows: a 52px thumbnail with radius 10, then the name (14.5px / 700), "Qty N" (13px muted), and the line total (700).
  - Then a dashed divider and the Total at 30px / 800.
  - Then the status and error blocks, then the "Place order" button.
  - **Status** (`statusMessage`): background `#f1ecff`, text `#2e1a66`, with a spinner (a 14px ring). Shows "Placing your order...", then "Confirming your order...".
  - **Error** (`errorMessage`): the error banner style.
  - **Place order button**: mango, height 58, radius 14, 17px / 800. While submitting, it is disabled and its label equals the status message.
- Empty basket: a dashed card with "Your basket is empty", the text "Add something before checking out.", and a "Browse products" button.
- After success, the app navigates to `/orders/:id` (existing behaviour). Style the order-detail page to match if you are asked to.

### Sign in (`login`; apply the same styling to `register`)
- The page is centred, with padding 72px 48px.
- A 1000px card: two equal columns, radius 24, border `#efe6d4`, with the sign-in shadow.
- **Left panel**:
  - Background `#4b2a99`, padding 48, laid out with space-between.
  - Top: a 48px mango tile with radius 14 and a dark "E" (22px / 800).
  - Bottom: "Your basket is waiting." (40px / 800 / line-height 1.05 / -0.03em, white), then "Sign in to add items, check out and track every order in one place." (16px / 1.6, `#e5dcfb`).
- **Right panel** (padding 48, gap 18):
  - "Sign in" (30px / 800), with "Welcome back to EShop." below it (14.5px muted).
  - Username field (height 50).
  - Password field (height 50) with a "Show"/"Hide" toggle inside: background `#f1ecff`, grape text at 13px / 700, height 38, radius 9.
  - Required errors: "Username is required." and "Password is required."
  - Server error banner: "Incorrect username or password." for a 401, otherwise `error.detail ?? error.title`.
  - Submit button: mango, height 54, "Sign in". While submitting it shows "Signing in…" and is disabled.
  - Below: "Don't have an account? **Register**", which links to `/register`.
- The header shows its signed-out state on this page. Keep the `returnUrl` handling.
- **Register**: use the same shell and copy pattern. Left panel: "Join EShop." Right panel title: "Create account". Keep the existing register form fields and validators.

## Interactions & Behavior summary
- Card and image hover: `.2s` lift. Chip hover: border and text turn grape. Mango buttons go to `#f5a300` on hover.
- Every interactive element needs a visible focus ring: `0 0 0 4px #ece4ff` plus a grape border, or `outline: 2px solid #4b2a99; outline-offset: 2px` for buttons.
- Minimum touch target is 40px; steppers and icon buttons are 44px.
- **Responsive** (not drawn; implement the following):
  - **≤1100px**: grid becomes 3 columns; the header search shrinks to flex 1.
  - **≤900px**:
    - Grid becomes 2 columns.
    - The details, basket and checkout columns stack, with the summary below the list and no longer sticky.
    - Header nav collapses into a menu button.
    - The sign-in left panel is hidden.
  - **≤560px**:
    - Grid becomes 2 columns with a gap of 12.
    - Basket rows switch to a two-line layout: the thumbnail and name on the first line; the stepper, total and remove button on the second.
    - Checkout field rows stack.
    - Horizontal padding drops to 16.

## State Management
No new state is needed. Reuse the existing signals:
- `ProductList`: category, sortBy/sortDirection, searchTerm, pageIndex, loading, result.
- `ProductDetail`: product, quantity, adding.
- `BasketService`: cart, itemCount.
- `CheckoutForm`: form, submitting, statusMessage, errorMessage.
- `Login`: form, submitting, errorMessage.

Additions:
- `ProductDetail`: a `toast` signal, cleared after 4 seconds.
- `Login`: a `showPassword` signal.
- `ProductList`: an in-basket quantity lookup from `BasketService.cart()`, used for the "✓ In basket · N" state.
- `ProductDetail`: the related products request.

## Assets
- **Category illustration tiles**: flat geometric shapes in `#1d1230` with an accent `#4b2a99`, drawn with CSS boxes on a `#fff4dc` background. See `ProductArt.dc.html` for the exact construction:
  - Smart Phone → a phone outline.
  - Camera → a camera body with a lens.
  - White Appliances → a washing machine.
  - Home Kitchen → a pot.
- Implement this as an Angular `ProductImage` component that takes `category`, `imageFile` and an optional `src`. The mapping is by category, never by product name.
- Note the existing seed-data issues: Huawei and Xiaomi are under "White Appliances", the LG phone is under "Home Kitchen", and `product-6.png` is used by two products. Do not "fix" this data. Document it.
- Icons: the existing Material Icons are fine (`shopping_bag`, `search`, `close`, `check`, `add`, `remove`), coloured `#1d1230` or `#57506a`.

## Files in this bundle
- `EShop Redesign Concepts.dc.html`: all four concepts. **Implement column 1d.** The header contains the audit notes and the scorecard.
- `EShopHeader.dc.html`: the header for each concept (`concept="d"` is the target).
- `ProductArt.dc.html`: the category illustration tiles.
- `Colour Directions.dc.html`: the palette exploration. 3b "Mango & Grape" was chosen.
- `support.js`: the runtime needed to open the `.dc.html` files in a browser.
- `screenshots/01-discover.png` … `05-sign-in.png`: 1d at 1440px wide. **Known capture artefact:** in `01-discover.png`, the category chips ("Home Kitchen", "Smart Phone", "White Appliances") and the "✓ In basket · 1" button appear wrapped onto two lines. In the live HTML they are a single line (`white-space: nowrap`). When the screenshot and the HTML differ, the HTML is the source of truth.

## Suggested prompt for Claude Code
> Read `design_handoff_eshop_redesign/README.md` and open `EShop Redesign Concepts.dc.html` (column 1d) as the visual reference. Restyle `frontend/eshop-angular` so the header, product list, product detail, basket, checkout, login and register match 1d exactly, using the tokens in the README as global CSS variables in `styles.scss` and overriding the Angular Material theme to match. Do not change services, API contracts, routes, guards or validation logic. Add a reusable `ProductImage` component with the category-tile fallback. Run `ng build`, `ng test` and the Playwright e2e suite (update selectors only where the copy changed), then write `UI_IMPLEMENTATION_NOTES.md` and `UI_TEST_REPORT.md`.
