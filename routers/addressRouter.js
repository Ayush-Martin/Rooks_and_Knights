//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as addressController from "../controllers/user/addressController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

//routers
router
  .route("/")
  .post(userAuthMiddleware.validUser, addressController.addAddress);

router
  .route("/:id")
  .delete(userAuthMiddleware.validUser, addressController.deleteAddress)
  .put(userAuthMiddleware.validUser, addressController.updateAddress);

export default router;
