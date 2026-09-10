import { ServerApiError } from "../lib";
import { createTheatre, theatreNumOfSeats, addMovieToTheatre } from "../services/ownerService";
import { tmdbGetMovieById } from "../services/tmdbMovieService";
import { apiJsonResponse, isValidDateInstance } from "../utils";
import prisma from "@movie-ticket-booking/db";
import type { NextFunction, Request, Response } from "express";
import { getTheatreActiveShows } from "../services/showService";
import type { Show, TMDBMovieType } from "@movie-ticket-booking/shared/types";

export async function createTheatreContoller(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const userId = user.id;
    const { title, address, city, country } = req.body;
    const theatreData = { title, userId, address, city, country };
    const created = await createTheatre(theatreData);
    res.status(201).json(apiJsonResponse(true, created, "Successfully created theatre", null));
  } catch (err) {
    next(err);
  }
}

export async function addMovieToTheatreController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const theatreId = req.params.theatreId as string;
    const tmdbMovieId = Number(req.body.tmdbMovieId);

    if (!theatreId || !tmdbMovieId || isNaN(tmdbMovieId)) {
      throw new ServerApiError("Invalid theatreId or invalid tmdb movie id", 400);
    }

    const [tmdbMovie, theatreSeatsCount] = await Promise.all([
      tmdbGetMovieById(tmdbMovieId),
      theatreNumOfSeats(theatreId),
    ]);

    // check min seats in theatre
    if (theatreSeatsCount <= 0) {
      throw new ServerApiError("Add seats to theatre before adding movies", 401);
    }

    // check that the movie exist
    if (!tmdbMovie) {
      throw new ServerApiError("Invalid tmdb movie id or movie already exist in this theatre", 401);
    }

    const createUpdateMovieObject = {
      tmdbMovieId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      adult: tmdbMovie.adult,
      original_language: tmdbMovie.original_language,
      release_date: new Date(tmdbMovie.release_date),
      popularity: tmdbMovie.popularity,
      status: tmdbMovie.status,
      tagline: tmdbMovie.tagline,
      img: tmdbMovie.img,
      genres: tmdbMovie.genres ?? [],
      vote_average: tmdbMovie.vote_average,
    };

    const createdMovie = await prisma.movie.upsert({
      where: {
        tmdbMovieId: tmdbMovieId,
      },
      create: {
        ...createUpdateMovieObject,
      },
      update: {
        ...createUpdateMovieObject,
      },
    });

    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    if (!isValidDateInstance(startTime) || !isValidDateInstance(endTime) || startTime >= endTime) {
      throw new ServerApiError("Invalid movie start or end date", 400);
    }

    const price = Number(req.body.price);
    if (!price || isNaN(price)) {
      throw new ServerApiError("Invalid movie ticket price value", 400);
    }

    // add movie to theatre
    const theatreMovie = await addMovieToTheatre(theatreId, createdMovie.id, startTime, endTime, price);
    res.status(201).json(apiJsonResponse(true, { theatreMovie }, "Successfully added movie to theatre", null));
  } catch (err) {
    console.log("errrrr", err);
    next(err);
  }
}

type MovieShowWithTimings = {
  movie: TMDBMovieType;
  shows: Show[];
};

export async function getShowController(req: Request, res: Response, next: NextFunction) {
  // TODO: create a valiate theatre request reusable function to verify if theatre is valid or not
  const theatreId = req.params.theatreId as string;
  if (!theatreId) {
    res.status(404).json(apiJsonResponse(false, null, "Invalid theatre id"));
  }

  try {
    const activeShows = await getTheatreActiveShows(theatreId);

    // tranform
    let activeShowsDto: MovieShowWithTimings[] = [];
    activeShows.forEach((movieShow) => {
      const { shows, tmdbMovieId, id, ...movie } = movieShow;
      const movieShowObj = {
        movie: { id: tmdbMovieId, ...movie },
        shows: shows,
      } as unknown as MovieShowWithTimings;
      activeShowsDto.push(movieShowObj);
    });

    if (!activeShows) res.status(404).json(apiJsonResponse(false, null, "Invalid theatre id"));
    res.status(200).json(apiJsonResponse(true, activeShowsDto, "Successfully fetched movies"));
  } catch (err) {
    next(err);
  }
}
