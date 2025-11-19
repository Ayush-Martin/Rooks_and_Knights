//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as homeController from "../controllers/homeController.js";

router.get("/", homeController.getHome);

export default router;
