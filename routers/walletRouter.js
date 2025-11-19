import express from "express";
const router = express.Router();

//controllers
import * as walletController from "../controllers/walletController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  walletController.getWallet
);
router.post(
  "/addToWallet",
  userAuthMiddleware.validUser,
  walletController.postWallet
);
router.post(
  "/completePayment",
  userAuthMiddleware.validUser,
  walletController.completePayment
);

export default router;
