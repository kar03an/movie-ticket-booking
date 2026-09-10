import { ServerApiError } from "../lib";
import prisma from "@movie-ticket-booking/db";
import type {
  Theatre,
  Show,
  ShowSeat,
} from "@movie-ticket-booking/shared/types";

export async function createTheatre(theatreData: Omit<Theatre, "id">) {
  let created = null;
  try {
    created = await prisma.theatre.create({
      data: {
        ...theatreData,
      },
    });
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to create theatre", 501);
  }
  return created;
}

// check if theatre has minimum seats to add movie
export async function theatreNumOfSeats(theatreId: string) {
  let seatsCount = 0;
  try {
    seatsCount = await prisma.seat.count({
      where: {
        theatreId: theatreId,
      },
    });
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to count number of seats in theatre", 501);
  }
  return seatsCount ?? 0;
}

export async function addMovieToTheatre(
  theatreId: string,
  movieId: string,
  start: Date,
  end: Date,
  price: number,
) {
  try {
    // get all the seats of theatre
    const seats = await prisma.seat.findMany({
      where: {
        theatreId: theatreId,
      },
    });

    const theatreMovie: Show = await prisma.$transaction(async (tx) => {
      const createdTheatreMovie = await tx.show.create({
        data: {
          theatreId: theatreId,
          movieId: movieId,
          startTime: start,
          endTime: end,
        },
      });

      const theatreMovieSeatsData = seats.map((seat) => {
        const data: Omit<ShowSeat, "id"> = {
          showId: createdTheatreMovie.id,
          seatId: seat.id,
          status: "AVAILABLE",
          price: price,
        };
        return data;
      });

      // insert theatre movie seats rows using theatre's seats
      // mark all of them available initially
      await tx.showSeat.createManyAndReturn({
        data: theatreMovieSeatsData,
        skipDuplicates: true,
      });
      return createdTheatreMovie;
    });
    return theatreMovie;
  } catch (err) {
    console.log(err);
    throw new ServerApiError("DB Error: Failed to add movie to theatre", 500);
  }
}
