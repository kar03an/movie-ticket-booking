"use client";

import { Clapperboard, Search } from "lucide-react";
import MovieCard, { MovieCardSkeleton } from "@/components/movie/movie-card";
import EmptyState from "@/components/ui/empty-state";
import type { TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import type { ClientSessionUser } from "../providers/auth-provider";

export function MovieGrid({
  movies,
  isPending,
  isError,
  search,
  user,
  onShowAll,
  preview = false,
}: {
  movies: TMDBMoviesType[];
  isPending: boolean;
  isError: boolean;
  search: string;
  user: ClientSessionUser;
  onShowAll: () => void;
  preview?: boolean;
}) {
  if (isPending) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {Array.from({ length: 8 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Clapperboard size={48} strokeWidth={1} />}
        title="Failed to load movies"
        description="Please check your connection and try again."
      />
    );
  }

  if (movies.length === 0) {
    return (
      <EmptyState
        icon={<Search size={48} strokeWidth={1} />}
        title="No results found"
        description={`No films matched ${search ? `"${search}"` : "your filters"}.`}
        action={
          <button type="button" onClick={onShowAll} className="btn-cinema mt-2">
            Show all movies
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} user={user} preview={preview} />
      ))}
    </div>
  );
}
