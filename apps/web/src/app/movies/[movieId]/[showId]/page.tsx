"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { env } from "@movie-ticket-booking/env/web";
import SelectTheatreMovieSeat from "@/components/select-seat-component";
import BuyTheatreMovieSeat from "@/components/buy-seat-component";
import { MapPin, Calendar } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

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
  movieTitle?: string;
}

async function fetchShowSeats(
  movieId: string,
  showId: string,
): Promise<TheatreMovieSeatsData> {
  // Fetch seats
  const seatsRes = await fetch(
    `${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}/${showId}`,
    { cache: "no-store" },
  );

  if (!seatsRes.ok) {
    throw new Error(`Failed to fetch seats: ${seatsRes.status}`);
  }

  const seatsJson: ApiResponse<{ theatreMovieSeatsData: TheatreMovieSeatDto[] }> =
    await seatsRes.json();

  if (!seatsJson.success) {
    throw new Error(seatsJson.message || "Failed to fetch theatre movie seats");
  }

  // Fetch movie details (to get theatre + show time info)
  const movieRes = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}`, {
    cache: "no-store",
  });

  let theatreData: TheatreData | undefined;
  let showTime: { start: string; end: string } | undefined;
  let movieTitle: string | undefined;

  if (movieRes.ok) {
    const movieJson = await movieRes.json();
    const data = movieJson?.data;
    movieTitle = data?.movie?.title;

    // Walk the datesWithTheatreTimings map to find the matching showId slot
    const dateMap: Record<
      string,
      Record<
        string,
        {
          theatreData: TheatreData;
          dates: { start: string; end: string; showId: string }[];
        }
      >
    > = data?.datesWithTheatreTimings ?? {};

    outer: for (const dateKey of Object.keys(dateMap)) {
      for (const theatreId of Object.keys(dateMap[dateKey])) {
        const entry = dateMap[dateKey][theatreId];
        const slot = entry.dates.find((d) => d.showId === showId);
        if (slot) {
          theatreData = entry.theatreData;
          showTime = { start: slot.start, end: slot.end };
          break outer;
        }
      }
    }
  }

  return {
    ...seatsJson.data,
    theatreData,
    showTime,
    movieTitle,
  };
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
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
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

  const { theatreMovieSeatsData: seats, theatreData, showTime, movieTitle } = data;

  return (
    <div className="pb-28 pt-6">
      {!isBuying && (
        <div className="mx-auto mb-2 max-w-2xl px-4">
          <p className="eyebrow">Select your seat</p>
          <h1 className="font-display mt-1 text-2xl font-semibold">{movieTitle ?? "Showtime"}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {theatreData && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {theatreData.title}
              </span>
            )}
            {showTime && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatDate(showTime.start)} · {formatTime(showTime.start)}
              </span>
            )}
          </div>
        </div>
      )}
      {isBuying && selectedSeat && (
        <BuyTheatreMovieSeat
          selectedSeat={selectedSeat}
          movieTitle={movieTitle ?? "Movie"}
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
