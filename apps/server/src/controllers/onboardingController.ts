import { apiJsonResponse } from "../utils";
import { type Request, type Response } from "express";
import type { AuthenticatedRequest } from "@movie-ticket-booking/shared/types";
import { onboardCustomer, onboardOwner } from "../services/onboardingService";

export async function onboardingController(req: Request, res: Response) {
  const request = req as unknown as AuthenticatedRequest;
  const user = request.user;
  if (!user) {
    return res.status(401).json(apiJsonResponse(false, null, "Unauthorized user session"));
  }

  const { role } = req.body;
  if (!role || (role !== "OWNER" && role !== "CUSTOMER")) {
    return res
      .status(400)
      .json(apiJsonResponse(false, null, "Invalid role. Must be CUSTOMER or OWNER"));
  }

  try {
    if (role === "CUSTOMER") {
      const { name } = req.body as { name?: string };

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json(apiJsonResponse(false, null, "Name is required"));
      }

      const customer = await onboardCustomer({
        name: name,
        userId: user.id,
      });

      return res.status(200).json(apiJsonResponse(true, { customer }, "Onboarding complete"));
    }

    if (role === "OWNER") {
      const { title, address, city, country } = req.body as {
        title?: string;
        address?: string;
        city?: string;
        country?: string;
      };

      if (!title || !address || !city || !country) {
        return res
          .status(400)
          .json(apiJsonResponse(false, null, "title, address, city and country are all required"));
      }

      const ownerObject = {
        title: title,
        address: address,
        city: city,
        country: country,
      };
      const theatre = await onboardOwner({
        userId: user.id,
        ...ownerObject,
      });
      return res.status(201).json(apiJsonResponse(true, { theatre }, "Onboarding complete"));
    }
  } catch (err) {
    console.error("Onboarding controller error:", err);
    return res.status(500).json(apiJsonResponse(false, null, "Internal server error"));
  }
}
