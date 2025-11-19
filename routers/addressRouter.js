//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as addressController from "../controllers/addressController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

//routers
router.post(
  "/add",
  userAuthMiddleware.validUser,
  addressController.postNewAddress
); //add new address
router.delete(
  "/delete/:id",
  userAuthMiddleware.validUser,
  addressController.deleteAddress
); //delete address
router.put(
  "/edit/:id",
  userAuthMiddleware.validUser,
  addressController.putAddress
); //edit address

export default router;
