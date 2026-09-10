import { ServerApiError } from "../lib";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { apiJsonResponse } from "../utils";
import type { Request, Response } from "express";
import z from "zod";

export async function getProfileController(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json(apiJsonResponse(false, null, "Unauthorized"));
  }

  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    return res.status(404).json(apiJsonResponse(false, null, "User not found"));
  }
  return res.status(200).json(apiJsonResponse(true, { userProfile }, "Profile fetched"));
}

const updateCustomerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

const updateTheatreSchema = z.object({
  email: z.string().email().optional(),
  title: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

export async function updateProfileController(req: Request, res: Response) {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json(apiJsonResponse(false, null, "Unauthorized"));
  }

  const userProfile = await getUserProfile(user.id);
  if (!userProfile) {
    return res.status(404).json(apiJsonResponse(false, null, "User not found"));
  }

  // validate input body
  if (user.role === "CUSTOMER") {
    var customervalidation = updateCustomerSchema.safeParse(req.body);
    if (!customervalidation.success) {
      throw new ServerApiError("Invalid update input", 400);
    }
  }
  if (user.role === "OWNER") {
    var ownervalidation = updateTheatreSchema.safeParse(req.body);
    if (!ownervalidation.success) {
      throw new ServerApiError("Invalid update input", 400);
    }
  }

  try {
    const updateProfile = await updateUserProfile(user.id, req.body);
    return res.status(200).json(apiJsonResponse(true, { updateProfile }, "Profile updated"));
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json(apiJsonResponse(false, null, "Internal server error"));
  }
}
