"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ChevronRight, Clock, Star, X } from "lucide-react";
import type { TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import type { ClientSessionUser } from "@/components/providers/auth-provider";
import { MoviePoster } from "@/components/movie/movie-poster";

function movieYear(date: Date) {
  const year = new Date(date).getFullYear();
  return Number.isFinite(year) ? String(year) : "—";
}

function movieDateLabel(date: Date) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Release date unknown" : parsed.toLocaleDateString();
}

export default function MovieDetailsPopup({
  movie,
  user,
  onClose,
}: {
  movie: TMDBMoviesType;
  user: ClientSessionUser;
  onClose: () => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const detailHref = (user.role === "OWNER" ? `/dashboard/movies/${movie.id}/add` : `/movies/${movie.id}`) as Route;
  const actionLabel = user.role === "OWNER" ? "Add showtime" : "Book tickets";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="movie-popup-title">
      <button type="button" className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-label="Close movie details" onClick={onClose} />

      <article className="surface-card relative z-10 grid max-h-[88vh] w-full max-w-2xl overflow-hidden sm:grid-cols-[220px_1fr]">
        <div className="relative hidden aspect-[2/3] sm:block sm:aspect-auto sm:min-h-full">
          <MoviePoster src={movie.img} alt={movie.original_title} title={movie.original_title} width={440} height={660} />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="h-1 bg-linear-to-r from-burgundy via-primary to-gold" />
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div>
              <p className="eyebrow mb-2">Film details</p>
              <h2 id="movie-popup-title" className="font-display text-2xl font-semibold leading-tight">
                {movie.original_title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4 aspect-[2/3] max-h-56 overflow-hidden rounded-xl border border-border sm:hidden">
              <MoviePoster src={movie.img} alt={movie.original_title} title={movie.original_title} width={400} height={500} />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                <Star className="size-3 fill-gold stroke-none" />
                {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "—"}
              </span>
              <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {movieYear(movie.release_date)}
              </span>
              <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {movie.original_language}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {movieDateLabel(movie.release_date)}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {movie.overview || "No overview available for this title yet."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4">
            <button type="button" onClick={onClose} className="btn-cinema-ghost px-4 py-2.5">
              Close
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
