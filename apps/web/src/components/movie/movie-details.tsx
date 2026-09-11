"use client";

import type { TMDBMovieType } from "@movie-ticket-booking/shared/types";
import { cn } from "@/lib/utils";
import { MoviePoster } from "@/components/movie/movie-poster";

export function MovieSummary({ movie }: { movie: TMDBMovieType }) {
  if (!movie) {
    return null;
  }

  const genres = movie.genres ? movie.genres.slice(0, 4) : [];

  return (
    <div className="relative flex justify-center overflow-hidden border-b w-full border-border">
      <div className="max-w-2xl">
        {movie.img && (
          <div className="absolute inset-0 w-full h-full">
            <img
              src={movie.img}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-110 object-cover blur-2xl opacity-40"
            />
            <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/85 to-background/60" />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Fallback background when there's no image */}
        {!movie.img && (
          <div className="absolute inset-0 bg-linear-to-b from-muted to-background" />
        )}

        {/* Content */}
        <div className="relative flex h-full gap-5 p-5">
          <div className="h-44 w-32 shrink-0 overflow-hidden rounded-lg shadow-lg shadow-black/50 ring-1 ring-border">
            <MoviePoster src={movie.img} alt={movie.title} title={movie.title} width={256} height={384} />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <h3 className="truncate text-xl font-semibold tracking-tight text-foreground">{movie.title}</h3>

            {genres && genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <span
                    key={g.id}
                    className={cn(
                      "rounded-full border border-border bg-card/60 px-2.5 py-0.5",
                      "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                    )}
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="mt-3 line-clamp-7 max-w-2xl text-sm leading-relaxed tracking-wide text-muted-foreground">
                {movie.overview}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
