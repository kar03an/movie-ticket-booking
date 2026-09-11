"use client";

import { env } from "@movie-ticket-booking/env/web";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Armchair, Ticket, CreditCard, Tag } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import type { CURRENCY } from "@movie-ticket-booking/shared/types";

type SeatStatus = "AVAILABLE" | "SOLD";

interface TheatreMovieSeatDto {
  id: string;
  showId: string;
  seatId: string;
  status: SeatStatus;
  price: number;
  seat: {
    id: string;
    row: string;
    col: number;
  };
}

interface TheatreData {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
}

interface ShowTime {
  start: string;
  end: string;
}

interface BuyTheatreMovieSeatProps {
  selectedSeat: TheatreMovieSeatDto;
  movieTitle: string;
  theatreData: TheatreData | null;
  showTime: ShowTime | null;
}

export default function BuyTheatreMovieSeat({
  selectedSeat,
  movieTitle,
  theatreData,
  showTime,
}: BuyTheatreMovieSeatProps) {
  const { movieId, showId } = useParams<{
    movieId: string;
    showId: string;
  }>();
  const router = useRouter();

  const buySeatFn = async () => {
    const fetchUrl = `${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}/${showId}/book/${selectedSeat.id}`;
    const res = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        currency: "INR" as CURRENCY,
        amount: selectedSeat.price,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.message || "Failed to initiate booking");
    }

    const data = await res.json();
    return data;
  };

  const buySeatMutation = useMutation({
    mutationFn: buySeatFn,
    onSuccess: (data) => {
      const clientSecret: string | null = data?.data?.clientSecret ?? null;
      const orderId: string | null = data?.data?.orderId ?? null;
      if (!clientSecret) {
        console.error("No clientSecret returned from book API");
        return;
      }
      const params = new URLSearchParams({ clientSecret });
      if (orderId) params.set("orderId", orderId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/checkout?${params.toString()}` as any);
    },
  });

  const handleBuy = () => {
    if (buySeatMutation.isPending) return;
    buySeatMutation.mutate();
  };

  const isPending = buySeatMutation.isPending;
  const isError = buySeatMutation.isError;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8 gap-6">
      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Decorative top gradient */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-burgundy via-primary to-gold" />

        {/* Ticket header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Ticket className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Booking Summary</p>
            <h2 className="text-lg font-bold text-foreground leading-tight">{movieTitle}</h2>
          </div>
        </div>

        {/* Dashed divider (ticket perforation) */}
        <div className="relative flex items-center px-6 py-0">
          <div className="absolute -left-3 h-6 w-6 rounded-full bg-background border border-border" />
          <div className="flex-1 border-t border-dashed border-border" />
          <div className="absolute -right-3 h-6 w-6 rounded-full bg-background border border-border" />
        </div>

        {/* Details grid */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Theatre */}
          {theatreData && (
            <div className="col-span-2 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Theatre</p>
                <p className="text-sm font-semibold text-foreground">{theatreData.title}</p>
                <p className="text-xs text-muted-foreground">
                  {theatreData.address}, {theatreData.city}, {theatreData.country}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          {showTime && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(showTime.start)}</p>
              </div>
            </div>
          )}

          {/* Time */}
          {showTime && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Show Time</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatTime(showTime.start)}
                  <span className="text-muted-foreground mx-1">–</span>
                  {formatTime(showTime.end)}
                </p>
              </div>
            </div>
          )}

          {/* Seat */}
          <div className="flex items-start gap-3">
            <Armchair className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Seat</p>
              <p className="text-sm font-semibold text-foreground">
                Row {selectedSeat.seat.row} · Seat {selectedSeat.seat.col}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
              <p className="text-sm font-semibold text-foreground">₹{selectedSeat.price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Dashed divider (bottom perforation) */}
        <div className="relative flex items-center px-6 py-0">
          <div className="absolute -left-3 h-6 w-6 rounded-full bg-background border border-border" />
          <div className="flex-1 border-t border-dashed border-border" />
          <div className="absolute -right-3 h-6 w-6 rounded-full bg-background border border-border" />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-sm font-semibold text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">₹{selectedSeat.price.toFixed(2)}</span>
        </div>
      </div>

      {/* Error message */}
      {isError && (
        <p className="text-sm text-primary text-center max-w-sm">
          {(buySeatMutation.error as Error)?.message || "Something went wrong. Please try again."}
        </p>
      )}

      {/* Buy Button */}
      <button
        type="button"
        id="buy-seat-btn"
        onClick={handleBuy}
        disabled={isPending}
        className="btn-cinema"
      >
        <CreditCard className="h-4 w-4" />
        {isPending ? "Redirecting to payment…" : "Pay & Confirm Booking"}
      </button>
      <p className="text-xs text-muted-foreground">Secure payment powered by Stripe</p>
    </div>
  );
}
