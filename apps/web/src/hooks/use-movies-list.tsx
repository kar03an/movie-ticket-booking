"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Region, TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import { useMoviesFeed, useSearchMovies } from "@/app/movies/query";

function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useMoviesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(searchParamValue);
  const [sortBy, setSortBy] = useState("rating");
  const [movies, setMovies] = useState<TMDBMoviesType[]>([]);
  const [region] = useState<Region>("DELHI_NCR");

  const debouncedSearch = useDebounce(search, 350);
  const searchString = debouncedSearch.trim();
  const isSearching = searchString.length > 0;

  const moviesFeedQuery = useMoviesFeed(1, 100);
  const moviesSearchQuery = useSearchMovies(searchString);

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    updateQuery("search", searchString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  useEffect(() => {
    if (isSearching) return; // search results effect below takes over
    setMovies(moviesFeedQuery.data?.data?.movies ?? []);
  }, [moviesFeedQuery.data, isSearching]);

  useEffect(() => {
    if (!isSearching) return;
    const searchedMovies = moviesSearchQuery.data?.data.movies ?? [];
    const sorted = [...searchedMovies].sort((a, b) => b.vote_average - a.vote_average + (b.popularity - a.popularity));
    setMovies(sorted);
  }, [moviesSearchQuery.data, isSearching]);

  const activeQuery = isSearching ? moviesSearchQuery : moviesFeedQuery;

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    movies,
    isPending: activeQuery.isPending,
    isError: Boolean(activeQuery.error),
    clearFilters: () => setSearch(""),
  };
}
