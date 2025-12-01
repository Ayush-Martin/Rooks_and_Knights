//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as shopController from "../controllers/user/shopController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get("/", shopController.productsPage);
router
  .route("/product/:id")
  .get(userAuthMiddleware.getUser, shopController.productPage)
  .post(userAuthMiddleware.checkUserAuthenticated, shopController.addReview);

export default router;
