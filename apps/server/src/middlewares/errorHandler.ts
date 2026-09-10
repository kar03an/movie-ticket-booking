import type { ServerApiError } from "../lib";
import { apiJsonResponse } from "../utils";
import type { Request, Response, NextFunction } from "express";

export function apiErrorHandler(
  error: ServerApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error.status === undefined) {
    console.error("Unknown error thrown:", error);
    res.status(500).json(apiJsonResponse(false, null, "Internal Server Error"));
  } else {
    res.status(error.status).json(apiJsonResponse(false, null, error.message, error.error));
  }
}
