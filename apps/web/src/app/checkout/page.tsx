"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { env } from "@movie-ticket-booking/env/web";
import { ShieldCheck, Ticket, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
  developerTools: {
    assistant: {
      enabled: false,
    },
  },
} as Parameters<typeof loadStripe>[1]);

function CheckoutSpinner({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/15">
        <Loader2 className="h-5 w-5 animate-spin text-red-400" />
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-100">{label}</p>
        {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
      </div>
    </div>
  );
}

function PaymentFieldsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
        <div className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-800/60 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse" />
          <div className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-14 rounded bg-zinc-800 animate-pulse" />
          <div className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-800/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const session = useAuth();
  const email = session?.user.email;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        ...(email ? { receipt_email: email } : {}),
        payment_method_data: {
          billing_details: {
            name: session?.user.name || "Customer",
            email: email || "",
            phone: "",
            address: {
              line1: "",
              city: "",
              state: "",
              postal_code: "",
              country: "IN",
            },
          },
        },
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
    }
    setIsProcessing(false);
  };

  const formReady = Boolean(stripe && elements && isElementReady);

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8">
      {email && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Email</p>
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-300">
            {email}
          </div>
        </div>
      )}

      <div className="relative min-h-48">
        {!formReady && (
          <div className="absolute inset-0 z-10">
            <PaymentFieldsSkeleton />
          </div>
        )}

        <div className={formReady ? "opacity-100" : "pointer-events-none opacity-0"}>
          <PaymentElement
            onReady={() => setIsElementReady(true)}
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              paymentMethodOrder: ["card"],
              defaultValues: email
                ? {
                    billingDetails: { email },
                  }
                : undefined,
              wallets: {
                applePay: "never",
                googlePay: "never",
                link: "never",
              },
              terms: {
                card: "never",
              },
              fields: {
                billingDetails: "never",
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-800/80 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <button
        id="checkout-pay-btn"
        type="submit"
        disabled={!formReady || isProcessing}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:cursor-pointer hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing payment…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Confirm &amp; Pay
          </>
        )}
      </button>

      {isProcessing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-zinc-900/80 backdrop-blur-sm">
          <CheckoutSpinner label="Confirming your payment" hint="Keep this page open until it finishes." />
        </div>
      )}
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientSecret = searchParams.get("clientSecret");
  const orderId = searchParams.get("orderId");

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-red-600/10 blur-3xl" />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-semibold text-zinc-300">No payment session found.</p>
          <p className="text-xs text-zinc-500">Please go back and try again.</p>
          <button onClick={() => router.back()} className="mt-2 text-sm text-red-400 hover:underline">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
    fonts: [
      {
        cssSrc: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap",
      },
    ],
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#dc2626",
        colorBackground: "#27272a",
        colorText: "#f4f4f5",
        colorTextSecondary: "#71717a",
        colorTextPlaceholder: "#52525b",
        colorDanger: "#ef4444",
        colorIcon: "#a1a1aa",
        fontFamily: "Archivo, system-ui, sans-serif",
        fontSizeBase: "14px",
        borderRadius: "12px",
        spacingUnit: "8px",
        gridRowSpacing: "28px",
        gridColumnSpacing: "16px",
      },
      rules: {
        ".Label": {
          fontSize: "11px",
          fontWeight: "500",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#71717a",
          marginBottom: "10px",
        },
        ".Input": {
          backgroundColor: "rgba(39, 39, 42, 0.6)",
          border: "1px solid #3f3f46",
          boxShadow: "none",
          padding: "14px 16px",
          color: "#f4f4f5",
          lineHeight: "20px",
        },
        ".Input:focus": {
          border: "1px solid rgba(239, 68, 68, 0.6)",
          boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.15)",
        },
        ".Input--invalid": {
          border: "1px solid #7f1d1d",
        },
        ".TabList": {
          display: "none",
        },
        ".Block": {
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          padding: "0",
        },
        ".Error": {
          fontSize: "12px",
          color: "#f87171",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md mb-6">
        <button
          id="checkout-back-btn"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="relative px-8 pt-7 pb-5 border-b border-zinc-800">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-700 via-red-500 to-orange-400" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/15 text-red-400">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Secure Checkout</p>
              <h1 className="text-lg font-bold text-zinc-100 leading-tight">Complete your booking</h1>
              {orderId && <p className="text-xs text-zinc-600 mt-0.5 font-mono">Order #{orderId.slice(-8)}</p>}
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm />
          </Elements>
        </div>

        <div className="flex items-center justify-center gap-2 px-8 py-4 border-t border-zinc-800">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
          <p className="text-xs text-zinc-600">256-bit SSL encryption · Powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}

function CheckoutFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <CheckoutSpinner label="Preparing checkout" hint="Loading a secure payment form…" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
