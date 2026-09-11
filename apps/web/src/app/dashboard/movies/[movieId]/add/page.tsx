"use client";

import { useAuth } from "@/components/providers/auth-provider";
import type { Seat, Theatre } from "@movie-ticket-booking/shared/types";
import { useParams, useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { MovieSummary } from "@/components/movie/movie-details";
import { ShowtimeForm, type ShowtimeFormValues } from "./components/show-time-form";
import { SeatPicker } from "./components/seat-picker";
import { Loader2 } from "lucide-react";
import ErrorComponent from "@/components/error";
import { useTheatre } from "@/hooks/query/useTheatre";
import { useTheatreSeatsLayout } from "@/hooks/query/useTheatreSeatsLayout";
import { useMovie } from "@/hooks/query/useMovie";
import { useAddShowtimeMtn } from "@/hooks/mutation/useAddShowtimeMtn";

export default function AddMovieToTheatrePage() {
  const session = useAuth();
  const router = useRouter();
  const params = useParams<{ movieId: string }>();
  const movieId = params.movieId;

  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [seats, setSeats] = useState<Pick<Seat, "row" | "col">[]>([]);
  const [showtime, setShowtime] = useState<ShowtimeFormValues>({
    date: "",
    time: "",
    price: "",
  });

  const movieQuery = useMovie(movieId);
  const theatreQuery = useTheatre(session);
  const theatreSeatsLayout = useTheatreSeatsLayout(theatre?.id);
  const addShowtimeMutation = useAddShowtimeMtn(theatre!, movieId, showtime);

  useEffect(() => {
    if (!session) {
      router.replace("/auth" as Route);
    }
  }, [session, router]);

  useEffect(() => {
    const fetchedTheatre = theatreQuery.data ?? null;
    setTheatre(fetchedTheatre);
  }, [theatreQuery.data]);

  useEffect(() => {
    const fetchedTheatreSeats = theatreSeatsLayout.data ?? [];
    setSeats(fetchedTheatreSeats);
  }, [theatreSeatsLayout.data]);

  const rows = useMemo(() => Array.from(new Set(seats.map((s) => s.row))).sort(), [seats]);
  const maxCols = useMemo(() => seats.reduce((max, s) => Math.max(max, s.col), 0), [seats]);
  const isFormValid = showtime.date.length > 0 && showtime.time.length > 0 && Number(showtime.price) > 0;

  if (!session) return null;

  if (movieQuery.isPending || theatreQuery.isPending) {
    return (
      <div className="grid pt-72 place-items-center bg-background text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (movieQuery.isError) {
    return <ErrorComponent message={movieQuery.error.message} link="/dashboard/movies" linkText="Go back" />;
  }

  if (theatreQuery.isError) {
    return <div>{theatreQuery.error.message}</div>;
  }

  return (
    <div className="relative overflow-hidden bg-background pb-28 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/8 via-transparent to-transparent" />

      <div className="border-b border-border px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
            Add to {theatre?.title ?? "theatre"}
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Schedule a showtime</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the date, time and price, then choose which seats are open for this show.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full flex justify-center items-center flex-col">
        <MovieSummary movie={movieQuery.data} />

        <div className="mx-auto mt-8 w-full max-w-2xl px-4">
          <ShowtimeForm value={showtime} onChange={setShowtime} />
        </div>

        <div className="mt-10 w-full">
          {theatreSeatsLayout.isPending && (
            <p className="mt-4 text-center text-sm text-muted-foreground">Loading seat layout…</p>
          )}
          {theatreSeatsLayout.isError && (
            <p className="mt-4 text-center text-sm text-primary">
              Couldn't load the seat layout. {theatreSeatsLayout.error.message}
            </p>
          )}
          {theatreSeatsLayout.isSuccess && <SeatPicker rows={rows} maxCols={maxCols} seats={seats} />}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {showtime.date && showtime.time
              ? `${seats.length} seat${seats.length === 1 ? "" : "s"} · ready to publish`
              : `${seats.length} seat${seats.length === 1 ? "" : "s"} available`}
          </span>
          <button
            type="button"
            disabled={!isFormValid || addShowtimeMutation.isPending}
            onClick={() => addShowtimeMutation.mutate()}
            className="btn-cinema px-5 py-2.5"
          >
            {addShowtimeMutation.isPending ? "Adding…" : "Add Show"}
          </button>
        </div>
      </div>
    </div>
  );
}
