// @ts-check

/**
 * Wholesale order minimum — the binding one.
 *
 * The theme disables its own checkout button below the minimum, but that is
 * decoration: a cart permalink, a bare /checkout URL, or any express wallet
 * button (Shop Pay, Google Pay, Apple Pay) renders none of our Liquid and
 * walks straight past it. This function runs on Shopify's servers and is the
 * only thing standing between a ₹500 cart and a completed order.
 *
 * Keep MINIMUM_SUBTOTAL in step with `wholesale_min_order` in the theme
 * settings. They are the same rule stated in two currencies of measurement:
 * this one in rupees, the theme's in paise (300000 == 3000).
 */

/** Rupees, matching the store's currency. Theme setting is the paise twin. */
const MINIMUM_SUBTOTAL = 3000;

/** Hardcoded rather than formatted: the Wasm JS runtime has no full Intl. */
const MINIMUM_LABEL = "₹3,000";

const NO_CHANGES = /** @type {const} */ ({ operations: [] });

/**
 * @param {{
 *   buyerJourney: { step: string },
 *   cart: { cost: { subtotalAmount: { amount: string } } }
 * }} input
 */
export function cartValidationsGenerateRun(input) {
  // Only judge the cart at the checkout stages.
  //
  // This guard is load-bearing, not an optimisation. Validation errors also
  // surface at CART_INTERACTION, where they fail the mutation that raised
  // them — so without this, the very first add-to-cart would be rejected for
  // not yet reaching ₹3,000, and no customer could ever build a qualifying
  // cart. The minimum is a condition of ordering, not of shopping.
  const step = input.buyerJourney.step;
  if (step !== "CHECKOUT_INTERACTION" && step !== "CHECKOUT_COMPLETION") {
    return NO_CHANGES;
  }

  const subtotal = Number.parseFloat(input.cart.cost.subtotalAmount.amount);

  // Fail open on an unreadable subtotal. A malformed amount is our bug, and
  // the cost of it should be one under-minimum order to follow up on, not a
  // storefront that refuses every checkout until someone notices.
  if (Number.isNaN(subtotal) || subtotal >= MINIMUM_SUBTOTAL) {
    return NO_CHANGES;
  }

  const shortfall = Math.ceil(MINIMUM_SUBTOTAL - subtotal);

  return {
    operations: [
      {
        validationAdd: {
          errors: [
            {
              message:
                "Wholesale orders start at " +
                MINIMUM_LABEL +
                ". Add ₹" +
                shortfall +
                " more to check out.",
              // Attaches the message to the cart as a whole rather than to a
              // single field — the shortfall is a property of the order, and
              // no one line item is the one at fault.
              target: "$.cart",
            },
          ],
        },
      },
    ],
  };
}
