import { ServerApiError } from "../lib";
import { env } from "@movie-ticket-booking/env/server";
import type { TMDBMovieSearchFilter, TMDBMoviesType, TMDBMovieType } from "@movie-ticket-booking/shared/types";

export async function tmdbGetMovieById(id: number): Promise<TMDBMovieType> {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${env.TMDB_READ_ACCESS_TOKEN}`,
      },
    };

    const res = await fetch(url, options);
    const movie = (await res.json()) as unknown as TMDBMovieType & { backdrop_path: string };
    // movie = movie as unknown as TMDBMovieType & { backdrop_path: string };
    const basePath = "https://image.tmdb.org/t/p/";
    const size = "w780"; // options: w300, w780, w1280, original
    const backdropPath = movie.backdrop_path;
    const fullImageUrl = new URL(`${size}${backdropPath}`, basePath).toString();

    const movieResult: TMDBMovieType = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      adult: movie.adult,
      original_language: movie.original_language,
      release_date: movie.release_date,
      popularity: movie.popularity,
      vote_average: movie.vote_average,
      img: fullImageUrl,
      genres: movie.genres,
      status: movie.status,
      tagline: movie.tagline,
    };
    return movieResult;
  } catch (err) {
    throw new ServerApiError("Failed to fetch tmdb movie by id", 400, err);
  }
}

export async function tmdbSearchMovies(filter: TMDBMovieSearchFilter) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${filter.searchString}&include_adult=${filter.adult}&language=en-US&page=${filter.page}`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${env.TMDB_READ_ACCESS_TOKEN}`,
      },
    };
    const response = await fetch(url, options);
    const responseJson = (await response.json()) as { results: TMDBMoviesType[] };
    const movies = responseJson.results as TMDBMoviesType[];
    return movies;
  } catch (err) {
    throw new ServerApiError("Failed to search and fetch tmdb movie", 400, err);
  }
}
