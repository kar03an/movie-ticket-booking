import { ServerApiError } from "../lib";
import type { Request, Response, NextFunction } from "express";
import type z from "zod";

export interface ValidationSchemaType {
  params?: z.ZodObject;
  body?: z.ZodObject;
  query?: z.ZodObject;
}

export function validateRequest(validationSchema: ValidationSchemaType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const errors = [];
      for (const k in validationSchema) {
        const key = k as "params" | "body" | "query";
        const schema = validationSchema[key];
        if (schema) {
          const result = schema.safeParse(req[key]);
          if (!result.success) {
            const err = result.error.issues;
            errors.push(err);
          }
        }
      }

      if (errors.length > 0) {
        const missingFields: string[][] = [];
        errors.forEach((err) => {
          err.forEach((error) => {
            missingFields.push(error.path as string[]);
          });
        });
        throw new ServerApiError("Invalid request input", 400, {
          invalidInputFields: missingFields,
        });
      }
    } catch (err) {
      return next(err);
    }
    next();
  };
}
