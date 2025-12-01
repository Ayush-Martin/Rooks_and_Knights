//Importing modules
import express from "express";
const router = express.Router();

//controllers
import * as OTPRouter from "../controllers/user/OTPController.js";

//middlewares
import * as OTPMiddleware from "../middlewares/OTPMiddleware.js";

router
  .get("/verifyOTP", OTPMiddleware.isEmailEntered, OTPRouter.verifyOTPPage)
  .post("/verifyOTP", OTPRouter.verifyOTP);

router.post("/resendOTP", OTPRouter.resendOTP);

export default router;
