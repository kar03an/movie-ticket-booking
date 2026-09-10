import { getProfileController, updateProfileController } from "../controllers/profileController";
import { authRequired } from "../middlewares";
import express, { type Router } from "express";

const profileRouter: Router = express.Router();

profileRouter.get("/", authRequired, getProfileController);
profileRouter.patch("/", authRequired, updateProfileController);

export default profileRouter;
