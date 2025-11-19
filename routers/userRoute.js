//Importing modules
import express from "express";
const router = express.Router();
import passport from "passport";

//Controllers
import * as userController from "../controllers/userController.js";

//Middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import * as OTPMiddleware from "../middlewares/OTPMiddleware.js";

//Routers
//Login
router
  .get(
    "/login",
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    userController.loginPage
  )
  .post("/login", userController.login);
router.post("/logout", userController.logout);

//Register
router
  .get(
    "/register",
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    userController.registerPage
  )
  .post("/register", userController.register);

//Complete Register
router
  .get(
    "/completeRegister",
    [
      userAuthMiddleware.checkUserAlreadyAuthenticated,
      OTPMiddleware.checkOTPVerified,
    ],
    userController.completeRegisterPage
  )
  .post("/completeRegister", userController.completeRegister);

//google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  userController.googleCallback
);

//User account route
router.get(
  "/account",
  userAuthMiddleware.checkUserAuthenticated,
  userController.getAccount
);
router.put(
  "/account/updateProfile",
  userAuthMiddleware.validUser,
  userController.putAccount
);
router.post(
  "/account/changePassword",
  userAuthMiddleware.validUser,
  userController.postAccountChangePassword
);

router
  .get("/forgetPassword", userController.forgetPasswordPage)
  .post("/forgetPassword", userController.postForgetPassword);

router
  .get(
    "/resetPassword",
    OTPMiddleware.checkOTPVerified,
    userController.resetPasswordPage
  )
  .post("/resetPassword", userController.resetPassword);

export default router;
