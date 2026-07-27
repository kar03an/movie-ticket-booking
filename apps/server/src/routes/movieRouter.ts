import express, { Router } from "express";
import {
  getMoviesController,
  getMovieWithTimingsController,
  getTheatreMovieSeatsController,
  reserveMovieSeatController,
  buyMovieSeatController,
  searchMovieController,
  getMoviesFeedController,
  getMovieController,
} from "@/controllers/movieController";
import { authRequired, validateRequest, type ValidationSchemaType } from "@/middlewares";
import z from "zod";
import { createMovieContoller } from "@/controllers/movieController";

const CreateMovieRequestSchema: ValidationSchemaType = {
  body: z.object({
    tmdbMovieId: z.string().min(1),
    title: z.string().min(1),
    overview: z.string(),
    adult: z.boolean(),
    original_language: z.string(),
    release_date: z.string(),
    popularity: z.number(),
    status: z.string(),
    tagline: z.string(),
    img: z.string(),
    genres: z.array(z.object({ id: z.number(), name: z.string() })),
  }),
};

const GetMovieValidationSchema: ValidationSchemaType = {
  params: z.object({
    movieId: z.string().min(1),
  }),
};

const GetMovieWithTimingValidationSchema: ValidationSchemaType = GetMovieValidationSchema;

const GetMoviesFeedValidationSchema: ValidationSchemaType = {
  query: z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(8),
  }),
};

const GetTheatreMovieValidationSchema: ValidationSchemaType = {
  params: z.object({
    movieId: z.string().min(1),
    showId: z.string().min(1),
  }),
};

const SeatReserveRequestSchema: ValidationSchemaType = {
  params: z.object({
    movieId: z.string(),
    showId: z.string(),
    showSeatId: z.string(),
  }),
};

const SeatBookRequestSchema: ValidationSchemaType = {
  params: z.object({
    movieId: z.string(),
    showId: z.string(),
    showSeatId: z.string(),
  }),
  body: z.object({
    currency: z.string(),
    amount: z.coerce.number(),
  }),
};

const MovieSearchRequestSchema: ValidationSchemaType = {
  query: z.object({
    searchString: z.string(),
    adult: z.boolean().optional().default(true),
    page: z.number().optional().default(1),
  }),
};

const moviesRouter: Router = express.Router();

// create movie
moviesRouter.post("/", authRequired, validateRequest(CreateMovieRequestSchema), createMovieContoller);

moviesRouter.get("/", getMoviesController);

// get movie with available theatres with timing
moviesRouter.get(
  "/feed",
  validateRequest(GetMoviesFeedValidationSchema),
  getMoviesFeedController,
);

moviesRouter.get("/search", validateRequest(MovieSearchRequestSchema), searchMovieController);

// get movie with available theatres with timing
moviesRouter.get(
  "/:movieId/timings",
  validateRequest(GetMovieWithTimingValidationSchema),
  getMovieWithTimingsController,
);

moviesRouter.get("/:movieId", validateRequest(GetMovieValidationSchema), getMovieController);

// get theatre movie seats (seats reservation page)
moviesRouter.get("/:movieId/:showId", validateRequest(GetTheatreMovieValidationSchema), getTheatreMovieSeatsController);

moviesRouter.post(
  "/:movieId/:showId/reserve/:showSeatId",
  authRequired,
  validateRequest(SeatReserveRequestSchema),
  reserveMovieSeatController,
);

moviesRouter.post(
  "/:movieId/:showId/book/:showSeatId",
  authRequired,
  validateRequest(SeatBookRequestSchema),
  buyMovieSeatController,
);

export default moviesRouter;
