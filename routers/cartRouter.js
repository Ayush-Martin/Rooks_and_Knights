//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as cartController from "../controllers/user/cartController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  cartController.cartPage
);

router
  .route("/:id")
  .post(userAuthMiddleware.validUser, cartController.addToCart)
  .delete(
    userAuthMiddleware.checkUserAuthenticated,
    cartController.deleteCartItem
  )
  .patch(
    userAuthMiddleware.checkUserAuthenticated,
    cartController.updateCartItemQuantity
  );

export default router;
