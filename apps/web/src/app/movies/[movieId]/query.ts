import { env } from "@movie-ticket-booking/env/web";
import type { Movie } from "@movie-ticket-booking/shared/types";
import { useQuery } from "@tanstack/react-query";

interface Theatre {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
}

interface ShowSlot {
  start: string;
  end: string;
  showId: string;
}

interface TheatreWithTimings {
  theatreData: Theatre;
  dates: ShowSlot[];
}

// Keyed by theatreId
type TheatreTimingsMap = Record<string, TheatreWithTimings>;

// Keyed by formatted date string, e.g. "25 June 2026"
export type DatesWithTheatreTimings = Record<string, TheatreTimingsMap>;

interface MovieResponse {
  movie: Movie;
  datesWithTheatreTimings: DatesWithTheatreTimings;
}

export function useMovieWithTimings(movieId: string) {
  return useQuery<MovieResponse>({
    queryKey: ["fetch-movie-with-timings", movieId],
    queryFn: () => fetchMovieDetailsWithTimings(movieId),
    enabled: !!movieId,
  });
}

async function fetchMovieDetailsWithTimings(movieId: string): Promise<MovieResponse> {
  const url = `${env.NEXT_PUBLIC_SERVER_URL}/movies/${movieId}/timings`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch movie timings`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to fetch movie timings");
  }
  return json.data;
}
