"use client";

import { Star, MapPin, Clock, CalendarDays } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { formatDatePillParts, formatTime } from "@/lib/utils";
import type { Movie } from "@movie-ticket-booking/shared/types";
import { useMovieWithTimings, type DatesWithTheatreTimings } from "@/hooks/query/useMovieWithTimings";

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
          <div className="h-12 w-64 rounded bg-zinc-800" />
          <div className="h-6 w-32 rounded bg-zinc-800" />
          <div className="h-32 rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (fetchMovieQuery.isError || !movie) {
    return (
      <div className="container py-20 text-center mx-auto px-6">
        <h2 className="text-2xl font-semibold text-zinc-400">Movie not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5 py-12 md:py-20">
        {/* Blurred Backdrop Poster */}
        {movie.img && (
          <div className="absolute inset-0 select-none pointer-events-none">
            <img
              src={movie.img}
              alt=""
              className="h-full w-full object-cover opacity-15 blur-3xl scale-110"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-transparent" />
          </div>
        )}
        <div className="absolute left-1/2 top-0 h-125 w-125 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end relative z-10">
            <div className="relative aspect-[2/3] w-full max-w-[280px] self-center md:self-auto overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shrink-0">
              {movie.img ? (
                <img
                  src={movie.img}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-600">Poster</div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-semibold text-yellow-400">
                  <Star className="h-4 w-4 fill-yellow-400 stroke-none" />
                  {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}/10
                </div>

                {movie.release_date && (
                  <span className="text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.original_language && (
                  <span className="text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 uppercase">
                    {movie.original_language}
                  </span>
                )}

                {genresList.map((genre) => (
                  <span key={genre} className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-3.5 py-1.5">
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl text-white [font-family:var(--display,'Fraunces',serif)]">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mb-4 text-lg italic text-zinc-400 font-medium">{movie.tagline}</p>
              )}

              <p className="mb-8 text-base leading-relaxed text-zinc-300 max-w-2xl">{movie.overview}</p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById("showtimes")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-lg bg-red-600 px-8 py-4 font-semibold text-white transition hover:bg-red-700 active:scale-95 duration-150 cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Book Tickets
                </button>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur hover:bg-white/10 active:scale-95 duration-150 transition cursor-pointer"
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
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white">Showtimes</h2>

            {dateGroupKeys.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8 text-center text-zinc-500">
                No showtimes scheduled yet — check back soon.
              </div>
            ) : (
              <div>
                {/* ── Date carousel ── */}
                <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 mr-2">
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
                            ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "border-white/10 bg-white/5 text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
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
                  <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8 text-center text-zinc-500">
                    No theatres showing this movie on the selected date.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {sortedTheatreEntries.map(([theatreId, { theatreData, dates }]) => (
                      <div
                        key={theatreId}
                        className="w-full flex md:flex-row flex-col justify-between gap-6 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-zinc-900/60"
                      >
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{theatreData.title}</h3>
                          <p className="flex items-center gap-2 text-sm text-zinc-400">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
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
                                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4.5 py-3 text-sm font-semibold text-zinc-100 transition duration-150 hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-inherit cursor-pointer"
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
