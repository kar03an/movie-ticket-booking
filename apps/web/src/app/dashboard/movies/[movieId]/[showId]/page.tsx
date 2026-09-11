"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { env } from "@movie-ticket-booking/env/web";
import SelectTheatreMovieSeat from "@/components/select-seat-component";
import BuyTheatreMovieSeat, { type TicketMovie } from "@/components/buy-seat-component";

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface TheatreMovieSeatsData {
  theatreMovieSeatsData: TheatreMovieSeatDto[];
  theatreData?: TheatreData;
  showTime?: { start: string; end: string };
  movie?: TicketMovie;
}

async function fetchShowSeats(
  movieId: string,
  showId: string,
): Promise<TheatreMovieSeatsData> {
  const seatsRes = await fetch(
    `${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}/${showId}`,
    { cache: "no-store" },
  );

  if (!seatsRes.ok) {
    throw new Error(`Failed to fetch seats: ${seatsRes.status}`);
  }

  const seatsJson: ApiResponse<TheatreMovieSeatsData> = await seatsRes.json();

  if (!seatsJson.success) {
    throw new Error(seatsJson.message || "Failed to fetch theatre movie seats");
  }

  return seatsJson.data;
}

function useShowSeats(movieId: string, showId: string) {
  return useQuery({
    queryKey: ["theatre-movie-seats", showId],
    queryFn: () => fetchShowSeats(movieId, showId),
    enabled: !!showId,
    staleTime: 0, // seat availability changes fast, don't cache stale state
  });
}

interface ProceedBarProps {
  selectedSeat: TheatreMovieSeatDto | null;
  onProceed: () => void;
  isProceeding: boolean;
}

function ProceedBar({ isProceeding, selectedSeat, onProceed }: ProceedBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {selectedSeat ? "Selected seat" : "No seat selected"}
          </span>
          <span className="text-sm font-medium text-foreground">
            {selectedSeat
              ? `${selectedSeat.seat.row}${selectedSeat.seat.col} · ₹${selectedSeat.price}`
              : "Tap a seat to continue"}
          </span>
        </div>
        <button
          type="button"
          disabled={!selectedSeat}
          onClick={onProceed}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {isProceeding ? "Proceeding" : "Proceed to buy"}
        </button>
      </div>
    </div>
  );
}

export default function ShowPage() {
  const { movieId, showId } = useParams<{
    movieId: string;
    showId: string;
  }>();

  const { data, isLoading, isError } = useShowSeats(movieId, showId);
  const [selectedSeat, setSelectedSeat] = useState<TheatreMovieSeatDto | null>(null);
  const [isProceeding, setIsProceeding] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);

  const reserveSeatFn = async () => {
    const fetchUrl = `${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}/${showId}/reserve/${selectedSeat?.id}`;
    const res = await fetch(fetchUrl, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return;
    const resData = await res.json();
    console.log("reserve seat data: ", resData);
    return resData;
  };

  const proceedToBuyMutation = useMutation({
    mutationFn: reserveSeatFn,
    onSuccess: () => {
      setIsProceeding(false);
      setIsBuying(true);
    },
  });

  const handleProceed = () => {
    if (!selectedSeat || isProceeding) return;
    setIsProceeding(true);
    proceedToBuyMutation.mutate();
  };

  const handleSelectSeat = (seat: TheatreMovieSeatDto) => {
    setSelectedSeat((prev) => (prev?.id === seat.id ? null : seat));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading seats…
      </div>
    );
  }

  if (isError || !data) {
    console.log("no seats: ", data, isError)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-foreground/90">Couldn't load seats for this show.</p>
        <p className="text-xs text-muted-foreground">Try refreshing the page.</p>
      </div>
    );
  }

  const { theatreMovieSeatsData: seats, theatreData, showTime, movie } = data;

  return (
    <div className="min-h-screen bg-background pb-28 pt-6">
      {isBuying && selectedSeat && (
        <BuyTheatreMovieSeat
          selectedSeat={selectedSeat}
          movie={movie ?? { title: "Movie" }}
          theatreData={theatreData ?? null}
          showTime={showTime ?? null}
        />
      )}
      {!isBuying && (
        <SelectTheatreMovieSeat
          seats={seats}
          selectedSeatId={selectedSeat?.id ?? null}
          onSelectSeat={handleSelectSeat}
        />
      )}
      {!isBuying && (
        <ProceedBar
          isProceeding={isProceeding}
          selectedSeat={selectedSeat}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
}
