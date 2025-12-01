//modules
import express from "express";
const router = express.Router();

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

//controllers
import * as wishlistController from "../controllers/user/wishlistController.js";

//routers
router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  wishlistController.wishlistPage
);

router
  .route("/:id")
  .post(userAuthMiddleware.validUser, wishlistController.addToWishlist)
  .delete(userAuthMiddleware.validUser, wishlistController.deleteFromWishlist);

export default router;
