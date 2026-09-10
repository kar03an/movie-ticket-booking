import express, { Router } from "express";
import ownerRouter from "./ownerRouter";
import onboardingRouter from "./onboardingRouter";
import profileRouter from "./profileRouter";
import { authRequired } from "../middlewares/index";
import moviesRouter from "./movieRouter";

const apiRouter: Router = express.Router();

apiRouter.use("/owner", authRequired, /* validateOwnerRole, */ ownerRouter); // TODO: disabled during testing
// apiRouter.use("/c", authRequired, /*validateCustomerRole,*/ customerRouter); // TODO: disabled during testing
apiRouter.use("/movies", moviesRouter);
apiRouter.use("/onboard", onboardingRouter);
apiRouter.use("/profile", authRequired, profileRouter);

export default apiRouter;
