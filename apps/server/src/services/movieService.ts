import { ServerApiError } from "@/lib";
import prisma from "@movie-ticket-booking/db";
import type { Movie, Show, TMDBMovieType } from "@movie-ticket-booking/shared/types";
import { format } from "date-fns";
import { updateTheatreMovieSeatExpiredReservation } from "./seatService";
import type { JsonObject } from "../../../../packages/db/prisma/generated/internal/prismaNamespace";
import { tmdbGetMovieById } from "./tmdbMovieService";

export async function createMovie(movieData: Omit<Movie, "id" | "genres"> & { genres: JsonObject }) {
  try {
    const movie = await prisma.movie.create({
      data: {
        ...movieData,
      },
    });
    return {
      movie,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to create theatre", 501);
  }
}

export async function getMovies() {
  try {
    const movies = await prisma.movie.findMany();
    return {
      movies,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to query movies", 500);
  }
}

// get movies details and all the theatres list where movies is available
export async function getMovieDetailsAndTheatres(movieId: string) {
  try {
    const [movie, theatreMovie] = await Promise.all([
      prisma.movie.findUnique({
        where: {
          id: movieId,
        },
      }),
      prisma.show.findMany({
        where: {
          movieId: movieId,
        },
        include: {
          theatre: true,
        },
      }),
    ]);

    const theatreMovies = theatreMovie.sort((th1: Show, th2: Show) => {
      if (th1.startTime < th2.startTime) return 1;
      return -1;
    });

    const data: any = {};
    const dates: string[] = [];
    theatreMovies.forEach((tm) => {
      const formattedDayString = format(tm.startTime, "dd MMMM yyyy");
      if (!dates.includes(formattedDayString)) dates.push(formattedDayString);
    });

    dates.forEach((day) => {
      const theatreWithTimings: any = {};
      theatreMovies.forEach((tm) => {
        const formattedDayString = format(tm.startTime, "dd MMMM yyyy");
        if (day === formattedDayString) {
          const thId = tm.theatreId;
          const theatre = theatreWithTimings[thId];
          if (!theatre) {
            theatreWithTimings[thId] = {
              theatreData: tm.theatre,
              dates: [{ start: tm.startTime, end: tm.endTime, showId: tm.id }],
            };
          } else {
            const dates = theatre.dates;
            dates.push({ start: tm.startTime, end: tm.endTime, showId: tm.id });
            theatreWithTimings[thId].dates = dates;
          }
        }
      });
      data[day] = theatreWithTimings;
    });

    return {
      movie: { ...movie },
      datesWithTheatreTimings: data,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to query movie details", 500);
  }
}

export async function getMovieDetailsbyTmdbMovieId(tmdbMovieId: number) {
  try {
    let dbMovie = await prisma.movie.findUnique({
      where: {
        tmdbMovieId: tmdbMovieId,
      },
    });
    if (!dbMovie) {
      let movie = (await tmdbGetMovieById(tmdbMovieId)) as TMDBMovieType & { tmdbMovieId: number };
      movie.tmdbMovieId = tmdbMovieId;
      return movie;
    }
    return dbMovie;
  } catch (error) {
    throw new ServerApiError("DB Error: Failed to fetch movie", 500, error);
  }
}

export async function getMovieDetailsbyDbMovieId(movieId: string) {
  try {
    let dbMovie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
    });
    if (!dbMovie) {
      throw "Invalid movie id provided";
    }
    let movie = (await tmdbGetMovieById(dbMovie.tmdbMovieId)) as TMDBMovieType & { tmdbMovieId: number };
    movie.tmdbMovieId = dbMovie.tmdbMovieId;
    return movie;
  } catch (error) {
    throw new ServerApiError("DB Error: Failed to fetch movie", 500, error);
  }
}

// get movies details and all the theatres list where movies is available
export async function getShowSeats(showId: string) {
  try {
    const seats = await prisma.showSeat.findMany({
      where: {
        showId: showId,
      },
      include: {
        seat: {
          select: {
            id: true,
            row: true,
            col: true,
          },
        },
        seatReservations: {
          select: {
            reservedAt: true,
            duration: true,
          },
        },
      },
    });
    // TODO: Also return the user with seat for whom the seat is reserved, so frontend won't show the seat as reserved the user for whom its already reserved

    // filter all the seats with expired reservation
    const seatsWithExpiredReservation = seats.filter((s) => {
      let recentReservation = s.seatReservations[0];
      s.seatReservations.forEach((reservation) => {
        if (!recentReservation || reservation.reservedAt > recentReservation.reservedAt) {
          recentReservation = reservation;
        }
      });

      if (!recentReservation) return false;
      const reservedAt = recentReservation.reservedAt;
      const duration = recentReservation.duration;
      const expireAt = new Date(reservedAt);
      expireAt.setMinutes(expireAt.getMinutes() + duration);

      const currDate = new Date();
      if (currDate > expireAt) {
        return true;
      }
      return false;
    });

    await updateTheatreMovieSeatExpiredReservation(seatsWithExpiredReservation);
    return {
      theatreMovieSeatsData: seats,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to query movie details", 500, err);
  }
}

export async function getMoviesFeed(page: number, limit: number) {
  try {
    const offset = (page - 1) * limit;
    const currDate = new Date();

    const [movies, totalCount] = await Promise.all([
      prisma.movie.findMany({
        where: {
          shows: {
            some: {
              startTime: {
                gte: currDate,
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: {
          release_date: "desc",
        },
      }),
      prisma.movie.count({
        where: {
          shows: {
            some: {
              startTime: {
                gte: currDate,
              },
            },
          },
        },
      }),
    ]);

    return {
      movies,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to query movies feed", 500, err);
  }
}
