"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useMoviesList } from "@/hooks/use-movies-list";
import { HeroHeader } from "@/components/movie/hero-header";
import { MovieGrid } from "@/components/movie/movie-grid";
import { redirect } from "next/navigation";
import { useMoviesFeed } from "@/app/movies/query";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MoviesPage() {
  const auth = useAuth();
  const { search, setSearch, movies: searchMovies, isPending: isSearchPending, isError: isSearchError, clearFilters } = useMoviesList();
  const [feedPage, setFeedPage] = useState(1);
  const feedLimit = 10;
  const { data: feedData, isPending: isFeedPending, isError: isFeedError } = useMoviesFeed(feedPage, feedLimit);

  if (auth === null) redirect("/auth");

  const feedMovies = feedData?.data?.movies ?? [];
  const totalPages = feedData?.data?.totalPages ?? 1;

  const isSearching = search.trim().length > 0;

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#fafafa] [font-family:var(--body,'Archivo',sans-serif)] pb-20">
      <HeroHeader search={search} setSearch={setSearch} showRegion={true} />

      <main className="max-w-7xl mx-auto pt-8 px-6 space-y-12">
        {/* Search Section */}
        {isSearching && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-white">Search Results</h2>
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-red-500 hover:text-red-400 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
            <MovieGrid
              movies={searchMovies}
              isPending={isSearchPending}
              isError={isSearchError}
              search={search}
              user={auth.user}
              onShowAll={clearFilters}
            />
          </section>
        )}

        {/* Feed Section (Currently Showing) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Currently Showing</h2>
              <p className="text-sm text-zinc-400 mt-1">Explore movies with active showtimes</p>
            </div>
          </div>

          <MovieGrid
            movies={feedMovies}
            isPending={isFeedPending}
            isError={isFeedError}
            search=""
            user={auth.user}
            onShowAll={() => {}}
          />

          {/* Pagination Controls */}
          {!isFeedPending && !isFeedError && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                disabled={feedPage === 1}
                onClick={() => setFeedPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition duration-150 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFeedPage(p)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition duration-150 cursor-pointer ${
                      feedPage === p
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={feedPage === totalPages}
                onClick={() => setFeedPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition duration-150 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
