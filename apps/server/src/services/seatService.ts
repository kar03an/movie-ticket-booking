import { ServerApiError } from "@/lib";
import prisma from "@movie-ticket-booking/db";
import type { ShowSeat } from "@movie-ticket-booking/shared/types";
import { SEAT_RESERVATION_DURATION } from "@movie-ticket-booking/shared/constants";
import type { BatchPayload } from "../../../../packages/db/prisma/generated/internal/prismaNamespace";

type Seat = {
  row: string;
  col: number;
};

export async function createSeatsBulk(seats: Seat[], theatreId: string) {
  let createdSeats = null;
  try {
    const seatsToBeCreated = seats.map((seat) => {
      return {
        theatreId: theatreId,
        row: seat.row,
        col: seat.col,
      };
    });
    createdSeats = await prisma.seat.createManyAndReturn({
      data: seatsToBeCreated,
      skipDuplicates: true,
    });
  } catch (err) {
    throw new ServerApiError("DB error: Failed to create bulk seats", 500);
  }
  return createdSeats;
}

export async function deleteSeatsBulk(seats: Seat[], theatreId: string): Promise<BatchPayload> {
  try {
    const rows: string[] = [];
    const cols: number[] = [];
    seats.forEach((seat) => {
      rows.push(seat.row);
      cols.push(seat.col);
    });

    let deletedSeats = await prisma.seat.deleteMany({
      where: {
        theatreId: theatreId,
        row: {
          in: rows,
        },
        col: {
          in: cols,
        },
      },
    });
    return deletedSeats;
  } catch (err) {
    console.log(err);
    throw new ServerApiError("DB error: Failed to delete bulk seats", 500);
  }
}

export async function reserveTheatreMovieSeat(customerId: string, showSeatId: string): Promise<boolean> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const seat = await tx.showSeat.findUnique({
        where: {
          id: showSeatId,
        },
      });
      if (!seat || seat.status === "SOLD") {
        return false;
      }

      const updatedResult = await tx.showSeat.updateMany({
        where: {
          id: showSeatId,
          status: "AVAILABLE",
        },
        data: {
          status: "SOLD",
        },
      });

      // optimistic approach
      if (!updatedResult || updatedResult.count !== 1) {
        return false;
      }

      // create a new reservation for seat
      await tx.showSeatReservation.create({
        data: {
          customerId: customerId,
          showSeatId: showSeatId,
          duration: SEAT_RESERVATION_DURATION,
          reservedAt: new Date(),
        },
      });
      return true;
    });
    return result;
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to reserve seat for user", 500);
  }
}

export async function verifySeatReservationForUser(customerId: string, showSeatId: string) {
  const reservedSeats = await prisma.showSeatReservation.findMany({
    where: {
      showSeatId: showSeatId,
      customerId: customerId,
    },
    orderBy: {
      reservedAt: "desc",
    },
  });
  if (!reservedSeats || reservedSeats.length === 0) return false;
  const firstReservation = reservedSeats[0];
  const reservedTime = new Date(firstReservation!.reservedAt);

  const expirationTimeStamp = new Date(reservedTime);
  expirationTimeStamp.setMinutes(expirationTimeStamp.getMinutes() + firstReservation!.duration);
  const currTimeStamp = new Date();

  if (expirationTimeStamp < currTimeStamp) {
    return false;
  }
  return true;
}

export async function updateTheatreMovieSeatExpiredReservation(
  theatreMovieSeats: ({ id: string } & Partial<ShowSeat>)[],
) {
  try {
    const ids = theatreMovieSeats.map((seat) => seat.id);
    const result = await prisma.showSeat.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: "AVAILABLE",
      },
    });
    return {
      seatsToUpdate: ids.length,
      seatsUpdated: result.count,
    };
  } catch (err) {
    throw new ServerApiError("DB Error: Failed to update theatre movie expired reservation seats status", 500, err);
  }
}
