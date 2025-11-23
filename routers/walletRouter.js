import express from "express";
const router = express.Router();

//controllers
import * as walletController from "../controllers/user/walletController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router
  .route("/")
  .get(userAuthMiddleware.checkUserAuthenticated, walletController.walletPage)
  .post(userAuthMiddleware.validUser, walletController.addAmountToWallet);

router
  .route("/completePayment")
  .post(userAuthMiddleware.validUser, walletController.completePayment);

export default router;
