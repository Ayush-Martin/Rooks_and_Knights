//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as cartController from "../controllers/cartController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  cartController.getCart
);
router.post(
  "/addToCart/:id",
  userAuthMiddleware.validUser,
  cartController.addToCart
);
router.delete(
  "/delete/:id",
  userAuthMiddleware.checkUserAuthenticated,
  cartController.deleteCartItem
);
router.patch(
  "/quantity/increase/:id",
  userAuthMiddleware.checkUserAuthenticated,
  cartController.increaseQuantity
);
router.patch(
  "/quantity/decrease/:id",
  userAuthMiddleware.checkUserAuthenticated,
  cartController.decreaseQuantity
);

export default router;
