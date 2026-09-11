"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useMoviesList } from "@/hooks/use-movies-list";
import { HeroHeader } from "@/components/movie/hero-header";
import { SortFiltersPanel } from "@/components/movie/sort-filters-panel";
import { ResultsMeta } from "@/components/movie/results-meta";
import { MovieGrid } from "@/components/movie/movie-grid";

export default function MoviesPage() {
  const auth = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const { search, setSearch, sortBy, setSortBy, movies, isPending, isError, clearFilters } = useMoviesList();

  if (!auth) return null;

  return (
    <div className="w-full pb-16">
      <HeroHeader search={search} setSearch={setSearch} showRegion={false} />

      {showFilters && <SortFiltersPanel sortBy={sortBy} onChange={setSortBy} />}

      <main className="max-w-7xl mx-auto pt-8 px-6 pb-16">
        {!isPending && !isError && (
          <ResultsMeta count={movies.length} hasActiveFilters={Boolean(search)} onClear={clearFilters} />
        )}

        <MovieGrid
          movies={movies}
          isPending={isPending}
          isError={isError}
          search={search}
          user={auth.user}
          onShowAll={clearFilters}
          preview={Boolean(search.trim())}
          showAction
        />
      </main>
    </div>
  );
}
