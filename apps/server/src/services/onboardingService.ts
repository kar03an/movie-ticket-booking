import { ServerApiError } from "../lib";
import prisma from "@movie-ticket-booking/db";
import type { ProfileType } from "@movie-ticket-booking/shared/types";

export async function onboardOwner(ownerData: {
  userId: string;
  title: string;
  address: string;
  city: string;
  country: string;
}) {
  try {
    // Check if already onboarded as owner
    const existing = await prisma.theatre.findUnique({ where: { userId: ownerData.userId } });
    if (existing) {
      throw new ServerApiError("User has already been onboarded as a owner", 409);
    }

    const [theatre] = await prisma.$transaction([
      prisma.theatre.create({
        data: {
          userId: ownerData.userId,
          title: ownerData.title.trim(),
          address: ownerData.address.trim(),
          city: ownerData.city.trim(),
          country: ownerData.country.trim(),
        },
      }),
      prisma.user.update({
        where: { id: ownerData.userId },
        data: { role: "OWNER", isOnboarded: true },
      }),
    ]);

    // Remove the default customer record created at sign-up
    await prisma.customer.deleteMany({ where: { userId: ownerData.userId } });
    return theatre;
  } catch (err) {
    if (err instanceof ServerApiError) {
      throw err;
    } else {
      throw new ServerApiError("Onboarding service internal server error", 400);
    }
  }
}

export async function onboardCustomer(customerData: { userId: string; name: string }) {
  try {
    const [customer] = await prisma.$transaction([
      prisma.customer.upsert({
        where: { userId: customerData.userId },
        update: { name: customerData.name.trim() },
        create: { name: customerData.name.trim(), userId: customerData.userId },
      }),
      prisma.user.update({
        where: { id: customerData.userId },
        data: { role: "CUSTOMER", isOnboarded: true },
      }),
    ]);
    return customer;
  } catch (err) {
    throw new ServerApiError("Onboarding service internal server error", 400);
  }
}
