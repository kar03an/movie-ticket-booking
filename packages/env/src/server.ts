import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    REDIS_URL: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    TMDB_API_KEY: z.string(),
    TMDB_READ_ACCESS_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
  client: {},
  clientPrefix: ""
});
