"use client";

import { Star, MapPin, Clock, CalendarDays } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useMovieWithTimings, type DatesWithTheatreTimings } from "./query";
import { formatDatePillParts, formatTime } from "@/lib/utils";
import type { Movie } from "@movie-ticket-booking/shared/types";
import { MoviePoster, MoviePosterBackdrop } from "@/components/movie/movie-poster";

export default function MoviePage() {
  const params = useParams<{ movieId: string }>();
  const router = useRouter();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const fetchMovieQuery = useMovieWithTimings(params.movieId);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [datesWithTheatreTimings, setDatesWithTheatreTimings] = useState<DatesWithTheatreTimings | null>(null);

  useEffect(() => {
    const data = fetchMovieQuery.data;
    setMovie(data?.movie ?? null);
    setDatesWithTheatreTimings(data?.datesWithTheatreTimings ?? null);
  }, [fetchMovieQuery.data]);

  // All derived showtime data lives behind one null-safe memo. When
  // `datesWithTheatreTimings` hasn't arrived yet (still pending, or the
  // movie genuinely has no showtimes), every field below falls back to an
  // empty/neutral value instead of throwing.
  const { dateGroupKeys, activeDateKey, sortedTheatreEntries } = useMemo(() => {
    if (!datesWithTheatreTimings) {
      return {
        dateGroupKeys: [] as string[],
        activeDateKey: null as string | null,
        sortedTheatreEntries: [] as [string, DatesWithTheatreTimings[string][string]][],
      };
    }

    const keys = Object.keys(datesWithTheatreTimings).sort((a, b) => {
      const aFirst = Object.values(datesWithTheatreTimings[a])[0]?.dates[0]?.start;
      const bFirst = Object.values(datesWithTheatreTimings[b])[0]?.dates[0]?.start;
      if (!aFirst || !bFirst) return 0;
      return new Date(aFirst).getTime() - new Date(bFirst).getTime();
    });

    // Default to the first (earliest) date once data loads.
    const active = selectedDateKey && keys.includes(selectedDateKey) ? selectedDateKey : (keys[0] ?? null);
    const activeTheatres = active ? datesWithTheatreTimings[active] : undefined;

    // Sort theatres alphabetically by name for the horizontal list.
    const sortedEntries = activeTheatres
      ? Object.entries(activeTheatres).sort((a, b) => a[1].theatreData.title.localeCompare(b[1].theatreData.title))
      : [];

    return { dateGroupKeys: keys, activeDateKey: active, sortedTheatreEntries: sortedEntries };
  }, [datesWithTheatreTimings, selectedDateKey]);

  // Safely extract movie genres list from JSON
  const genresList = useMemo(() => {
    if (!movie?.genres) return [];
    if (Array.isArray(movie.genres)) {
      return movie.genres.map((g: any) => {
        if (typeof g === "string") return g;
        if (g && typeof g === "object" && "name" in g) return g.name;
        return null;
      }).filter(Boolean);
    }
    return [];
  }, [movie?.genres]);

  if (fetchMovieQuery.isPending) {
    return (
      <div className="container py-20 mx-auto px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-12 w-64 rounded bg-muted" />
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (fetchMovieQuery.isError || !movie) {
    return (
      <div className="container py-20 text-center mx-auto px-6">
        <h2 className="font-display text-2xl font-semibold text-muted-foreground">Movie not found</h2>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border py-12 md:py-20">
        {/* Blurred Backdrop Poster */}
        <MoviePosterBackdrop src={movie.img} />
        <div className="pointer-events-none absolute top-0 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />

        <div className="relative container mx-auto px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end relative z-10">
            <div className="relative aspect-[2/3] w-full max-w-[280px] shrink-0 self-center overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:self-auto">
              <MoviePoster src={movie.img} alt={movie.title} title={movie.title} width={560} height={840} />
            </div>

            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold">
                  <Star className="h-4 w-4 fill-gold stroke-none" />
                  {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}/10
                </div>

                {movie.release_date && (
                  <span className="rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.original_language && (
                  <span className="rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    {movie.original_language}
                  </span>
                )}

                {genresList.map((genre) => (
                  <span key={genre} className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="font-display mb-4 text-4xl font-semibold tracking-tight md:text-6xl">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mb-4 text-lg font-medium text-muted-foreground italic">{movie.tagline}</p>
              )}

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">{movie.overview}</p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-cinema cursor-pointer px-8 py-4"
                >
                  Book Tickets
                </button>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cinema-ghost cursor-pointer px-8 py-4"
                >
                  Watch Trailer
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div id="showtimes" className="mt-0 lg:col-span-3 scroll-mt-24">
            <h2 className="font-display mb-6 text-3xl font-semibold tracking-tight">Showtimes</h2>

            {dateGroupKeys.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/60 p-8 text-center text-muted-foreground">
                No showtimes scheduled yet — check back soon.
              </div>
            ) : (
              <div>
                {/* ── Date carousel ── */}
                <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <div className="mr-2 flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    <CalendarDays className="h-4 w-4" />
                    Select Date
                  </div>
                  {dateGroupKeys.map((dateKey) => {
                    const firstSlotStart = Object.values(datesWithTheatreTimings![dateKey])[0]?.dates[0]?.start;
                    if (!firstSlotStart) return null;
                    const { day, date, month } = formatDatePillParts(firstSlotStart);
                    const isActive = dateKey === activeDateKey;

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDateKey(dateKey)}
                        className={`flex shrink-0 flex-col items-center rounded-xl border px-5 py-3 transition duration-200 cursor-pointer min-w-[70px] ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">{day}</span>
                        <span className="text-xl font-extrabold leading-none my-1">{date}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{month}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Theatres for the selected date ── */}
                {sortedTheatreEntries.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card/60 p-8 text-center text-muted-foreground">
                    No theatres showing this movie on the selected date.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {sortedTheatreEntries.map(([theatreId, { theatreData, dates }]) => (
                      <div
                        key={theatreId}
                        className="flex w-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/25 md:flex-row"
                      >
                        <div className="flex-1">
                          <h3 className="mb-2 font-display text-xl font-semibold">{theatreData.title}</h3>
                          <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                            {theatreData.address}, {theatreData.city}, {theatreData.country}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:max-w-[60%] justify-start md:justify-end">
                          {dates
                            .slice()
                            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                            .map((slot, idx) => {
                              const hasId = Boolean(slot.showId);
                              return (
                                <button
                                  key={`${theatreId}-${idx}`}
                                  disabled={!hasId}
                                  onClick={() => {
                                    if (!hasId) return;
                                    router.push(`/movies/${params.movieId}/${slot.showId}`);
                                  }}
                                  title={hasId ? undefined : "This showtime is missing an id (backend data issue)"}
                                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/40 px-4.5 py-3 text-sm font-semibold transition duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-muted/40 disabled:hover:text-inherit"
                                >
                                  <Clock className="h-4 w-4 opacity-70" />
                                  {formatTime(slot.start)}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
