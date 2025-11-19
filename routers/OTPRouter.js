//Importing modules
import express from "express";
const router = express.Router();

//controllers
import * as OTPRouter from "../controllers/OTPController.js";

//middlewares
import * as OTPMiddleware from "../middlewares/OTPMiddleware.js";

router.get("/verifyOTP", OTPMiddleware.isEmailEntered, OTPRouter.getVerifyOTP);
router.post("/verifyOTP", OTPRouter.postVerifyOTP);
router.get("/timer", OTPRouter.getTimer);
router.post("/resendOTP", OTPRouter.postResendOTP);

export default router;
