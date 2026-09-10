import { ServerApiError } from "../lib";
import { createSeatsBulk, deleteSeatsBulk } from "../services/seatService";
import { apiJsonResponse } from "../utils";
import prisma from "@movie-ticket-booking/db";
import type { Seat } from "@movie-ticket-booking/shared/types";
import type { NextFunction, Request, Response } from "express";

export async function createSeatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const theatreId = req.params.theatreId as string;
    if (!user || !user.id || !theatreId) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const theatre = await prisma.theatre.findUnique({
      where: {
        id: theatreId,
        userId: user.id,
      },
    });
    if (!theatre) {
      throw new ServerApiError("Invalid theatre, theatreId not found", 401);
    }

    const seats = req.body.seats;
    const created = await createSeatsBulk(seats, theatreId);
    console.log("created--", created);
    res
      .status(201)
      .json(
        apiJsonResponse(
          true,
          created,
          `Successfully created seats for theatre: \"${theatre.title}\"`,
          null,
        ),
      );
  } catch (err) {
    next(err);
  }
}

export async function udpateSeatLayoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const theatreId = req.params.theatreId as string;
    if (!user || !user.id || !theatreId) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const dbTheatre = await prisma.theatre.findUnique({
      where: {
        id: theatreId,
        userId: user.id,
      },
      include: {
        seat: {
          select: {
            row: true,
            col: true,
          },
        },
      },
    });
    if (!dbTheatre) {
      throw new ServerApiError("Invalid theatre, theatreId not found", 401);
    }

    const inputTheatreSeats = req.body.seats as {
      row: string;
      col: number;
      status: "available" | "unavailable";
    }[];
    const dbTheatreSeatsHashmap = new Map<string, boolean>();
    dbTheatre.seat.forEach((seat) => {
      const key = seat.row + ":" + String(seat.col);
      dbTheatreSeatsHashmap.set(key, true);
    });
    const seatsToDelete: Pick<Seat, "row" | "col">[] = [];
    const seatsToCreate: Pick<Seat, "row" | "col">[] = [];

    inputTheatreSeats.forEach((seat) => {
      const key = seat.row + ":" + String(seat.col);
      const isExistingSeat = dbTheatreSeatsHashmap.get(key) ?? false;
      if (!isExistingSeat && seat.status === "available") {
        seatsToCreate.push(seat);
      }
      if (isExistingSeat && seat.status === "unavailable") {
        seatsToDelete.push(seat);
      }
    });
    const created = await createSeatsBulk(seatsToCreate, theatreId);
    const deleted = await deleteSeatsBulk(seatsToDelete, theatreId);
    res.status(201).json(
      apiJsonResponse(
        true,
        {
          created,
          deleted,
        },
        `Successfully created seats for theatre: \"${dbTheatre.title}\"`,
        null,
      ),
    );
  } catch (err) {
    next(err);
  }
}

export async function getSeatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const theatreId = req.params.theatreId as string;
    if (!user || !user.id || !theatreId) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const theatre = await prisma.theatre.findUnique({
      where: {
        id: theatreId,
        userId: user.id,
      },
      include: {
        seat: true,
      },
    });
    if (!theatre) {
      throw new ServerApiError("Invalid theatre, theatreId not found", 401);
    }

    const theatreSeatsDto = {
      theatreSeats: theatre.seat,
    };

    res
      .status(201)
      .json(
        apiJsonResponse(
          true,
          theatreSeatsDto,
          `Successfully created seats for theatre: \"${theatre.title}\"`,
          null,
        ),
      );
  } catch (err) {
    next(err);
  }
}

export async function deleteSeatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const theatreId = req.params.theatreId as string;
    if (!user || !user.id || !theatreId) {
      throw new ServerApiError("Invalid user session req.user not found", 401);
    }

    const theatre = await prisma.theatre.findUnique({
      where: {
        id: theatreId,
        userId: user.id,
      },
    });
    if (!theatre) {
      throw new ServerApiError("Invalid theatre, theatreId not found", 401);
    }

    const seats = req.body.seats;
    await deleteSeatsBulk(seats, theatreId);
    res
      .status(204)
      .json(
        apiJsonResponse(
          true,
          null,
          `Successfully deleted seats for theatre: \"${theatre.title}\"`,
          null,
        ),
      );
  } catch (err) {
    next(err);
  }
}
