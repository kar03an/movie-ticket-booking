import { beforeEach, describe, expect, it } from "vitest";
import prisma from "@movie-ticket-booking/db";
import redisClient from "@movie-ticket-booking/cache";
import { createBookingFixture } from "@/seed/bookingFixture.seed";
import { createUsers } from "@/seed/customer.seed";

const BASE_URL = "http://localhost:3000";

const TEST_USERS_COUNT = 500;

describe("Concurrent Seat Reservation", () => {
  beforeEach(async () => {
    await redisClient.flushall();
  });

  it("should reserve a seat for only one customer", async () => {
    // ---------- Arrange ----------
    const fixture = await createBookingFixture({
      rows: 1,
      cols: 1,
    });

    const users = await createUsers(TEST_USERS_COUNT);
    const tokens = users.map((user) => {
      return user.sessionToken;
    });

    if (!fixture.showSeat) {
      throw new Error("Show seat to reserved is undefined");
    }

    const url = `${BASE_URL}/movies/${fixture.movie.id}/${fixture.show.id}/reserve/${fixture.showSeat.id}`;

    // ---------- Act ----------
    const responses = await Promise.all(
      tokens.map((token) => {
        return fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            cookie: token,
          },
        });
      }),
    );

    const bodies = await Promise.all(responses.map((r) => r.json()));

    // ---------- Assert Responses ----------
    const success = responses.filter((r) => r.status === 201);
    expect(success).toHaveLength(1);

    const failed = responses.filter((r) => r.status === 200 || r.status === 409);
    expect(failed).toHaveLength(TEST_USERS_COUNT - 1);

    // ---------- Assert Database ----------
    const reservations = await prisma.showSeatReservation.findMany({
      where: {
        showSeatId: fixture.showSeat.id,
      },
    });

    expect(reservations).toHaveLength(1);

    const showSeat = await prisma.showSeat.findUniqueOrThrow({
      where: {
        id: fixture.showSeat.id,
      },
    });

    expect(showSeat.status).toBe("SOLD");

    // ---------- Assert Redis ----------

    const key = `seat:${fixture.showSeat.id}:`;
    const reservedCustomerId = await redisClient.get(key);

    expect(reservedCustomerId).not.toBeNull();
    expect(reservations[0].customerId).toBe(reservedCustomerId);

    // ---------- Assert no duplicate reservations ----------

    const duplicateReservations = await prisma.showSeatReservation.groupBy({
      by: ["showSeatId"],
      _count: true,
      having: {
        showSeatId: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    expect(duplicateReservations).toHaveLength(0);
  }, 400000);
});
