# Wholesale order minimum

A single Shopify Function that refuses checkout below the wholesale minimum
(currently **₹3,000**). No server, no hosting, no Shopify Plus — validation
functions run on Basic.

## Why this exists separately from the theme

The theme disables its own checkout button below the minimum and explains the
shortfall. That is courtesy, not enforcement. These routes render no Liquid at
all and would otherwise sail through:

- a `/checkout` URL typed or bookmarked directly
- a cart permalink (`/cart/12345:1`)
- Shop Pay, Google Pay, Apple Pay and every other express wallet button
- anything hitting the Storefront API

Shopify's docs are explicit that the Cart and Checkout Validation Function API
is the only server-side way to cover express checkouts. So the rule lives here,
and the theme merely explains it.

## Deploying

Prerequisites: **Node 20+** (this machine currently has v12 — upgrade first) and
the Shopify CLI:

```bash
npm install -g @shopify/cli@latest
```

Then, from this directory, targeting the *wholesale* store:

```bash
shopify app deploy
```

The CLI will ask you to log in, pick an organisation, and create or select an
app. It writes `client_id` into `shopify.app.toml` and a `uid` into
`extensions/order-minimum/shopify.extension.toml` — commit both afterwards.

Install the app on the wholesale store when prompted, then switch it on:

**Admin → Settings → Checkout → Checkout Rules → Add rule → Wholesale order
minimum → Activate → Save.**

A deployed function does nothing until it is activated. This step is easy to
forget and silently leaves the minimum unenforced.

### Leave "Allow all customers to submit checkout" ticked

That checkbox governs what happens if the function throws at runtime. Ticked
means checkout proceeds anyway. Unticked means an exception blocks every
checkout on the store.

Ticked is the right default here: the worst case is a stray under-minimum
order you can follow up on, against a worst case of taking no orders at all.

## Changing the minimum

The number lives in **two** places and they must be changed together:

1. `MINIMUM_SUBTOTAL` in `extensions/order-minimum/src/cart_validations_generate_run.js`
   — in **rupees** (`3000`). Also update `MINIMUM_LABEL`. Then `shopify app deploy`.
2. `wholesale_min_order` in the theme's Settings → Wholesale — in **paise**
   (`300000`).

Change only the theme and the cart will invite people to a checkout that
rejects them. Change only the function and the cart will refuse orders it
should accept.

## If the CLI rejects this scaffold

`shopify.extension.toml` is a CLI-managed file and its accepted shape moves
with the CLI version. If `deploy` complains about the config, generate a fresh
extension and copy the two `src/` files over — they hold all the actual logic:

```bash
shopify app generate extension --template cart_checkout_validation --name order-minimum
```

## Testing it

From the storefront, not logged in, build a cart under ₹3,000 and try to check
out — including via the Shop Pay button, which is the case the theme cannot
cover. You should see the function's message and be unable to progress. Then
cross ₹3,000 and confirm checkout completes.

Adding to cart must keep working at any value. The `buyerJourney.step` guard in
the function exists for exactly that reason; if a first add-to-cart is ever
rejected for being under ₹3,000, that guard has been broken.
