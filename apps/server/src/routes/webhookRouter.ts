import { ServerApiError, stripe } from "../lib";
import { env } from "@movie-ticket-booking/env/server";
import sendTicketJob from "@movie-ticket-booking/queue";
import type { SendTicketJobDataType } from "@movie-ticket-booking/shared/types";
import express, { Router } from "express";

const webhookRouter: Router = express.Router();

webhookRouter.use(
  express.raw({
    type: "application/json",
  }),
);

webhookRouter.post("/stripe", async (req, res) => {
  // validate webhook request
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"] as string;

  // verify request
  let event = null;
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(
      "Payment Webhook Error: Stripe webhook request signature verification failed:",
      err.message,
    );
    throw new ServerApiError("Webhook secret verification failed", 400);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentTicketInfo = event.data.object.metadata;
      await sendTicketJob(paymentTicketInfo as SendTicketJobDataType);
      break;
    case "payment_intent.payment_failed":
      break;
    default:
      break;
  }
  console.log("WEBHOOK:STRIPE:", event.type);
  res.sendStatus(200);
});

export default webhookRouter;
