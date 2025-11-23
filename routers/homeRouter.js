//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as homeController from "../controllers/user/homeController.js";

router.get("/", homeController.homePage);

export default router;
