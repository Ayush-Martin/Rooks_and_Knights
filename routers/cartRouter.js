//requiring modules
const express = require("express");
const router = express.Router();

//controllers
const cartController = require("../controllers/cartController");

//middlewares
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

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

module.exports = router;
