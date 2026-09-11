"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Clock, ChevronRight } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import type { ClientSessionUser } from "../providers/auth-provider";
import { MoviePoster } from "@/components/movie/movie-poster";
import MovieDetailsPopup from "@/components/movie/movie-details-popup";

function movieYear(date: Date) {
  const year = new Date(date).getFullYear();
  return Number.isFinite(year) ? String(year) : "—";
}

function movieDateLabel(date: Date) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
}

export default function MovieCard({
  movie,
  user,
  preview = false,
}: {
  movie: TMDBMoviesType;
  user: ClientSessionUser;
  preview?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const detailHref = (user.role === "OWNER" ? `/dashboard/movies/${movie.id}/add` : `/movies/${movie.id}`) as Route;

  return (
    <>
      <article
        className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_40px_-24px] hover:shadow-primary/40"
        onClick={() => (preview ? setOpen(true) : router.push(detailHref))}
      >
        <div className="relative h-56">
          <MoviePoster src={movie.img} alt={movie.original_title} title={movie.original_title} width={400} height={500} />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg border border-gold/30 bg-background/70 px-2 py-1 text-[0.8125rem] font-semibold text-gold backdrop-blur-sm">
            <Star className="h-2.75 w-2.75 fill-gold stroke-none" />
            <span>{movie.vote_average > 0 ? (movie.vote_average.toFixed(1) ?? "—") : "—"}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-display m-0 line-clamp-2 text-base leading-[1.3] font-semibold">
            {movie.original_title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.03em] text-muted-foreground">
              {movieYear(movie.release_date)}
            </span>
            <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.03em] text-muted-foreground">
              {movie.original_language.toUpperCase() ?? ""}
            </span>
          </div>

          <p className="m-0 flex-1 line-clamp-2 text-[0.8125rem] leading-normal text-muted-foreground">
            {movie.overview || "No overview available."}
          </p>

          <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              {movieDateLabel(movie.release_date)}
            </span>

            {!preview && user.role === "CUSTOMER" && (
              <Link
                href={`/movies/${movie.id}` as Route}
                className="flex items-center gap-0.75 rounded-lg bg-primary px-3.5 py-1.5 text-[0.8125rem] font-semibold text-primary-foreground no-underline transition duration-150 hover:brightness-110"
                onClick={(e) => e.stopPropagation()}
              >
                Book
                <ChevronRight size={12} />
              </Link>
            )}
            {!preview && user.role === "OWNER" && (
              <Link
                href={`/dashboard/movies/${movie.id}/add` as Route}
                className="flex items-center gap-0.75 rounded-lg bg-primary px-3.5 py-1.5 text-[0.8125rem] font-semibold text-primary-foreground no-underline transition duration-150 hover:brightness-110"
                onClick={(e) => e.stopPropagation()}
              >
                Add
                <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </article>

      {preview && open && <MovieDetailsPopup movie={movie} user={user} onClose={() => setOpen(false)} />}
    </>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="skeleton-shimmer h-56" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="skeleton-shimmer h-3 w-[80%] rounded-md" />
        <div className="skeleton-shimmer h-3 w-[55%] rounded-md" />
        <div className="skeleton-shimmer h-3 w-[40%] rounded-md" />
      </div>
    </div>
  );
}
