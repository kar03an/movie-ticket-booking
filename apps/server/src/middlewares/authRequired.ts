import { apiJsonResponse } from "../utils";
import { auth } from "@movie-ticket-booking/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response, NextFunction } from "express";

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const user = session?.user;
  if (!session || !user) {
    return res.status(401).json(apiJsonResponse(false, null, "Unauthorized user session"));
  }

  req.user = user as unknown as Express.Request["user"];
  next();
}
