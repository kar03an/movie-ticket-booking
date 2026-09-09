import { auth } from "@movie-ticket-booking/auth";
import { env, trustedOrigins } from "@movie-ticket-booking/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import apiRouter from "./routes";
import { apiErrorHandler } from "./middlewares";
import "@movie-ticket-booking/cache";
import webhookRouter from "./routes/webhookRouter";

console.log("NODE_ENV value: ", env.NODE_ENV)

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || trustedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

// webhook routes: before express.json() middleware
app.use("/webhooks", webhookRouter);

app.use(express.json());

// routes
app.use(apiRouter);
app.use(apiErrorHandler);

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
