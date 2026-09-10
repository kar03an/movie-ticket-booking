import { ServerApiError } from "../lib";
import prisma from "@movie-ticket-booking/db";

export async function getTheatreActiveShows(theatreId: string) {
  try {
    const currDate = new Date();
    const movieShows = await prisma.movie.findMany({
      where: {
        shows: {
          some: {
            theatreId: theatreId,
            startTime: {
              gte: currDate, // get active shows
            },
          },
        },
      },
      include: {
        shows: {
          where: {
            theatreId: theatreId,
            startTime: {
              gte: currDate,
            },
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    return movieShows;
  } catch (error) {
    throw new ServerApiError("DB Error: Faild to fetch theatre active shows", 500, error);
  }
}

export async function getAllTheatreShows(theatreId: string) {
  try {
    const theatreShows = await prisma.show.findMany({
      where: {
        theatreId: theatreId,
      },
      orderBy: {
        startTime: "asc",
      },
    });
    console.log("theatreShows", theatreShows);
    return theatreShows;
  } catch (error) {
    throw new ServerApiError("DB Error: Faild to fetch all theatre shows", 500, error);
  }
}
