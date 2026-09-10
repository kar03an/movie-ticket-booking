import type { ProfileType, AuthenticatedRequest } from "@movie-ticket-booking/shared/types";
import type { NextFunction, Request, Response } from "express";
import { ServerApiError } from "../lib";

export * from "./authRequired";
export * from "./errorHandler";
export * from "./validateRequest";

function validateRole(user: AuthenticatedRequest["user"], role: ProfileType) {
  return user && user.role && user.role === role;
}

export function validateCustomerRole(req: Request, _res: Response, next: NextFunction) {
  const request = req as AuthenticatedRequest;
  if (!validateRole(request.user, "CUSTOMER")) {
    throw new ServerApiError("Missing owner role", 401);
  }
  next();
}

export function validateOwnerRole(req: Request, _res: Response, next: NextFunction) {
  const request = req as AuthenticatedRequest;
  if (!validateRole(request.user, "OWNER")) {
    throw new ServerApiError("Missing owner role", 401);
  }
  next();
}
