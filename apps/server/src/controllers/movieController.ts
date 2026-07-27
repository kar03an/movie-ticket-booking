import { ServerApiError, stripe } from "@/lib";
import {
  createMovie,
  getMovieDetails,
  getMovieDetailsAndTheatres,
  getMovies,
  getShowSeats,
  getMoviesFeed,
} from "@/services/movieService";
import { reserveTheatreMovieSeat, verifySeatReservationForUser } from "@/services/seatService";
import { tmdbSearchMovies } from "@/services/tmdbMovieService";
import { apiJsonResponse, convertIntoSmallestCurrencyUnit, minutesToSeconds } from "@/utils";
import redisClient from "@movie-ticket-booking/cache";
import prisma from "@movie-ticket-booking/db";
import { SEAT_RESERVATION_DURATION } from "@movie-ticket-booking/shared/constants";
import type { CURRENCY, TMDBMovieSearchFilter, TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import type { NextFunction } from "express";
import type { Request, Response } from "express";

export async function createMovieContoller(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.id) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const {
      tmdbMovieId,
      title,
      overview,
      adult,
      original_language,
      release_date,
      popularity,
      status,
      tagline,
      img,
      genres,
      vote_average,
    } = req.body;

    const movieData = {
      tmdbMovieId,
      title,
      overview,
      adult: !!adult,
      original_language,
      release_date: new Date(release_date),
      popularity: Math.round(popularity),
      status,
      tagline: tagline || "",
      img,
      genres: genres || [],
      vote_average,
    };

    const createdMovie = await createMovie(movieData);
    res.status(201).json(apiJsonResponse(true, createdMovie, "Successfully created movie", null));
  } catch (err) {
    next(err);
  }
}

export async function getMoviesFeedController(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    const data = await getMoviesFeed(page, limit);
    return res.status(200).json(apiJsonResponse(true, data, "Successfully fetched movies feed"));
  } catch (error) {
    next(error);
  }
}

// TODO: add pagination and filters
export async function getMoviesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const movies = await getMovies();
    return res.status(200).json(apiJsonResponse(true, movies, "Successfully fetched movies"));
  } catch (err) {
    next(err);
  }
}

export async function getMovieWithTimingsController(req: Request, res: Response, next: NextFunction) {
  try {
    const movieId = req.params.movieId as string;
    if (!movieId) throw new ServerApiError("Invalid movie id provided", 401);

    const movies = await getMovieDetailsAndTheatres(movieId);
    return res.status(200).json(apiJsonResponse(true, movies, "Successfully fetched movie"));
  } catch (err) {
    next(err);
  }
}

export async function getMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    const movieId = req.params.movieId as string;
    if (!movieId) throw new ServerApiError("Invalid movie id provided", 401);

    const tmdbMovieId = Number(movieId);
    if (!tmdbMovieId || isNaN(tmdbMovieId)) {
      throw new ServerApiError("Invalid movie id provided", 401);
    }

    const movies = await getMovieDetails(tmdbMovieId);
    return res.status(200).json(apiJsonResponse(true, movies, "Successfully fetched movie"));
  } catch (err) {
    next(err);
  }
}

export async function getTheatreMovieSeatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const showId = req.params.showId as string;
    if (!showId) throw new ServerApiError("Invalid theatre movie id provided", 401);

    const theatreMovie = await prisma.show.findUnique({
      where: { id: showId },
    });
    if (!theatreMovie) throw new ServerApiError("Invalid theatre movie id provided", 401);

    const seats = await getShowSeats(showId);
    return res.status(200).json(apiJsonResponse(true, seats, "Successfully fetched theatre movie seats"));
  } catch (err) {
    next(err);
  }
}

export async function reserveMovieSeatController(req: Request, res: Response, next: NextFunction) {
  try {
    const showId = req.params.showId as string;
    const showSeatId = req.params.showSeatId as string;
    const user = req.user;
    if (!user || !user.id || user.role !== "CUSTOMER") {
      throw new ServerApiError("Invalid session or invalid request by user", 401);
    }
    if (!showId) throw new ServerApiError("Invalid theatre movie", 401);
    if (!showSeatId) throw new ServerApiError("Invalid theatre movie seat", 401);

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer) {
      throw new ServerApiError("Unauthorized user making request to buy ticket", 402);
    }

    // check redis for reservation
    const key = `seat:${showSeatId}:`;
    const reservedForUserId: string | null = await redisClient.get(key);

    if (reservedForUserId) {
      // if reserved for same user who requested reservation then checkout to buy page
      if (reservedForUserId === customer.id) {
        return res.status(200).json(
          apiJsonResponse(
            true,
            {
              reservation: {
                reservedFor: user,
              },
            },
            "Seat already reserved for the user",
          ),
        );
      }
      // if reserved for another user return not available
      return res.status(200).json(apiJsonResponse(false, {}, "Seat not available right now"));
    }

    // call reserve seat service
    const reservationSuccess = await reserveTheatreMovieSeat(customer.id, showSeatId);

    // if seat couldn't be resesrved - gets reserved for another user -> return seat not available
    if (!reservationSuccess) {
      return res.status(409).json(apiJsonResponse(true, null, "Seat not available right now"));
    }

    // seat reserved successfully then update redis
    const expirationTime = minutesToSeconds(SEAT_RESERVATION_DURATION);
    await redisClient.set(key, customer.id, "EX", expirationTime, "NX");

    // TODO: push to expire reservation queue (bullmq)
    // expire reservation worker: remove reservation entry -> update seat status to available (don't if seat is in SOLD state) -> remove redis entry

    return res.status(201).json(apiJsonResponse(true, { reservedFor: user }, "Seat successfully reserved", null));
  } catch (err) {
    next(err);
  }
}

export async function buyMovieSeatController(req: Request, res: Response, next: NextFunction) {
  try {
    const showId = req.params.showId as string;
    const showSeatId = req.params.showSeatId as string;
    if (!showId) throw new ServerApiError("Invalid showId", 401);
    if (!showSeatId) throw new ServerApiError("Invalid showSeatId", 401);

    const amount = Number.parseInt(req.body.amount);
    const currency = req.body.currency as CURRENCY;
    if (!amount || isNaN(amount)) throw new ServerApiError("Invalid amount input", 401);
    if (!currency) throw new ServerApiError("Invalid currency input", 401);

    const user = req.user;
    if (!user || !user.id) {
      throw new ServerApiError("Unauthorized user making request to buy ticket", 402);
    }

    // verify user who's booking with the user who has reserved
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
    });
    if (!customer) {
      throw new ServerApiError("Unauthorized user making request to buy ticket", 402);
    }
    const verified = await verifySeatReservationForUser(customer.id, showSeatId);
    if (!verified) {
      throw new ServerApiError("Seat is not reserved for the user trying to buy the seat", 401);
    }

    // create draft order and payment with pending states, store payment providers id
    const result = await prisma.order.create({
      data: {
        status: "PENDING",
        customerId: customer.id,
        showSeatId: showSeatId,
        payment: {
          create: {
            amount: amount,
            currency: currency,
            paymentId: "", // update later
            paymentProvider: "STRIPE",
          },
        },
      },
    });

    // create payment intent
    let paymentIntent = null;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          // Amount value must be in the smallest currency unit (e.g., cents for USD)
          amount: convertIntoSmallestCurrencyUnit(amount, currency),
          currency: currency,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            customerId: result.customerId,
            orderId: result.id,
            showSeatId: showSeatId,
          },
        },
        {
          idempotencyKey: result.id,
        },
      );
    } catch (err) {
      console.log("error:", err);
      throw new ServerApiError("Failed to create payment intent to buy ticket with order.id: " + result.id, 500, err);
    }

    // udpate order payment table with payment intent id: this id will be used to update
    await prisma.order.update({
      where: {
        id: result.id,
      },
      data: {
        payment: {
          update: {
            data: {
              paymentId: paymentIntent.id,
            },
          },
        },
      },
    });

    return res.status(200).json(
      apiJsonResponse(true, {
        clientSecret: paymentIntent.client_secret,
        orderId: result.id,
      }),
    );
  } catch (err) {
    console.log("Error booking movie seat: ", err);
    next(err);
  }
}

// TODO: handle booking of muliple seats

// TODO: movie search api
export async function searchMovieController(req: Request, res: Response, next: NextFunction) {
  try {
    let { searchString, adult, page } = req.query as unknown as TMDBMovieSearchFilter;
    searchString = searchString ?? "";
    if (!page || isNaN(page) || page < 1) {
      page = 1;
    }
    if (adult === undefined || adult === null) {
      adult = true;
    }
    const movies = await tmdbSearchMovies({
      searchString,
      adult,
      page,
    });

    const moviesResponseData: TMDBMoviesType[] = [];
    const RESPONSE_LENGTH = 20;
    for (let i = 0; i < Math.min(RESPONSE_LENGTH, movies.length); i++) {
      const movie = movies[i] as TMDBMoviesType & { backdrop_path: string };
      const basePath = "https://image.tmdb.org/t/p/";
      const size = "w780"; // options: w300, w780, w1280, original
      const backdropPath = movie.backdrop_path;
      const fullImageUrl = new URL(`${size}${backdropPath}`, basePath).toString();

      moviesResponseData.push({
        id: movie.id,
        original_title: movie.original_title,
        overview: movie.overview,
        adult: movie.adult,
        original_language: movie.original_language,
        release_date: movie.release_date,
        popularity: movie.popularity,
        img: fullImageUrl,
        vote_average: movie.vote_average,
      });
    }
    return res.status(200).json(
      apiJsonResponse(true, {
        movies: moviesResponseData,
      }),
    );
  } catch (err) {
    console.log("Error booking movie seat: ", err);
    next(err);
  }
}
