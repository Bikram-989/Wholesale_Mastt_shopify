# Wholesale Mastt — wholesale.mastt.co

Shopify storefront for **wholesale.mastt.co**, a separate Shopify store from
retail `mastt.co`. Forked from the Mastt retail theme (Online Store 2.0,
Dawn-based) so the two sites look identical; the differences are deliberate and
listed below.

This repo is independent of `Mastt_shopify`. It has no shared git history and
no remote pointing at the retail repo — changes here can never reach retail.

## What differs from retail

**A ₹3,000 order minimum.** Enforced in two layers:

- `snippets/wholesale-min-notice.liquid` shows the shortfall and the theme
  disables the checkout button below the minimum, in the cart page and the cart
  drawer. Express wallet buttons are hidden rather than disabled, since Shopify
  renders those in its own iframe and they take no attribute from us.
- `wholesale-order-minimum-app/` is a Shopify Function that actually blocks
  checkout — including Shop Pay, Google Pay, Apple Pay, cart permalinks and
  direct `/checkout` URLs, none of which render any Liquid. See that
  directory's README for deployment; **a deployed function does nothing until
  it is activated** in Settings → Checkout → Checkout Rules.

The threshold is set in two places that must agree: `wholesale_min_order` in
theme settings (paise, `300000`) and `MINIMUM_SUBTOTAL` in the function
(rupees, `3000`).

**No promotional offers.** Removed from the retail theme:

- the tiered savings bar and the offers strip (`mastt-cart-tiers`,
  `mastt-cart-offers`, `mastt-cart-tiers.js`) and the `cart_tiers_*` settings
  that drove them, in the cart page, cart drawer and product page
- the homepage promo section entry, which carried "New Year Sale",
  "Buy 1 get 1 FREE" and a `MakeMeRare` coupon

`sections/kekaa__promo__section.liquid` is left in place so a wholesale-specific
promo can be added from the theme editor later; only the retail content is gone.

**No checkout from the add-to-cart popup.** That popup is rendered with the
header, so its copy of the cart predates the item just added and any minimum
test there would be wrong by exactly that item. It now links to the cart, where
the total is real.

## Setup after import

- Point the theme at this store's own products, collections and navigation —
  nothing syncs between the retail and wholesale stores, inventory included
- Upload logo/favicon via Theme Editor → Theme settings → Logo
- Confirm Settings → Wholesale → Minimum order value reads `300000`
- Deploy and **activate** the function in `wholesale-order-minimum-app/`

## Known leftovers

`assets/mastt-redesign.css` still carries the `.mtier` / `.moff` rules for the
removed offers bar. They are inert and were left alone rather than picked out of
a 2,500-line file for no functional gain. Safe to delete whenever that file is
next touched properly.
