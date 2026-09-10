import { ServerApiError } from "../lib";
import prisma from "@movie-ticket-booking/db";

export async function getUserProfile(userId: string) {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isOnboarded: true,
        customer: {
          select: { id: true, name: true },
        },
        theatre: {
          select: { id: true, title: true, address: true, city: true, country: true },
        },
      },
    });
    return dbUser;
  } catch (error) {
    throw new ServerApiError("DB Error: Faild to fetch user profile", 400);
  }
}

export async function updateUserProfile(userId: string, dto: any) {
  
}