//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as shopController from "../controllers/user/shopController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get("/", shopController.getProductList);
router.get(
  "/product/:id",
  userAuthMiddleware.getUser,
  shopController.getProduct
);
router.post(
  "/product/addReview/:id",
  userAuthMiddleware.checkUserAuthenticated,
  shopController.postReview
);

export default router;
