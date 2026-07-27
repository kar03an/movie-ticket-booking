"use client";

import { env } from "@movie-ticket-booking/env/web";
import type { TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import { useQuery } from "@tanstack/react-query";

interface MoviesResponse {
  data: {
    movies: TMDBMoviesType[];
  };
}

export interface MoviesFeedResponse {
  movies: TMDBMoviesType[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

export function useMoviesFeed(page: number = 1, limit: number = 8) {
  return useQuery<{ data: MoviesFeedResponse }>({
    queryKey: ["fetch-movies-feed", page, limit],
    queryFn: () => fetchFeedMovies(page, limit),
  });
}

export function useSearchMovies(searchString: string) {
  return useQuery<MoviesResponse>({
    queryKey: ["search-movies", searchString], // keyed on debounced value
    queryFn: () => searchMovies(searchString),
  });
}

async function searchMovies(searchString: string) {
  const url =
    env.NEXT_PUBLIC_SERVER_URL + `/movies/search?searchString=${encodeURIComponent(searchString)}`;
  const res = await fetch(url, {
    method: "GET",
  });
  return res.json();
}

async function fetchFeedMovies(page: number, limit: number) {
  const url = `${env.NEXT_PUBLIC_SERVER_URL}/movies/feed?page=${page}&limit=${limit}`;
  const res = await fetch(url, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch movies feed");
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to fetch movies feed");
  }
  return json;
}
