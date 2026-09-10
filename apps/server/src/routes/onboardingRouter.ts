import { authRequired } from "../middlewares/index";
import express, { type Router } from "express";
import { onboardingController } from "../controllers/onboardingController";

const onboardingRouter: Router = express.Router();

onboardingRouter.post("/", authRequired, onboardingController);

export default onboardingRouter;
