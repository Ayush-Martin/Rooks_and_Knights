//modules
import express from "express";
const router = express.Router();

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

//controllers
import * as wishlistController from "../controllers/wishlistController.js";

//routers
router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  wishlistController.getWishlist
);
router.post(
  "/:id",
  userAuthMiddleware.validUser,
  wishlistController.addToWihslist
);
router.delete(
  "/:id",
  userAuthMiddleware.validUser,
  wishlistController.deleteFromWishlist
);

export default router;
