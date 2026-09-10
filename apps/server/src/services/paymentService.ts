import { ServerApiError, stripe } from "../lib";
import { convertIntoSmallestCurrencyUnit } from "../utils";
import type { CURRENCY } from "@movie-ticket-booking/shared/types";

export async function createStripePaymentIntent(amount: number, currency: CURRENCY): Promise<any> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      // Amount value must be in the smallest currency unit (e.g., cents for USD)
      amount: convertIntoSmallestCurrencyUnit(amount, currency),
      currency: currency, 
      payment_method_types: ["card"],
    });
    return paymentIntent;
  } catch (err) {
    throw new ServerApiError("Payment ERR: Failed to create payment intent", 500);
  }
}

