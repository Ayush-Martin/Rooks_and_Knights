//Importing modules
import express from "express";
const router = express.Router();
import passport from "passport";

//Controllers
import * as userController from "../controllers/user/userController.js";

//Middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import * as OTPMiddleware from "../middlewares/OTPMiddleware.js";

//Routers
//Login
router
  .route("/login")
  .get(
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    userController.loginPage
  )
  .post(userController.login);

// Logout
router.post("/logout", userController.logout);

//Register
router
  .route("/register")
  .get(
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    userController.registerPage
  )
  .post(userController.register);

//Complete Register
router
  .route("/completeRegister")
  .get(
    [
      userAuthMiddleware.checkUserAlreadyAuthenticated,
      OTPMiddleware.checkOTPVerified,
    ],
    userController.completeRegisterPage
  )
  .post(userController.completeRegister);

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
router
  .route("/account")
  .get(userAuthMiddleware.checkUserAuthenticated, userController.accountPage)
  .put(userAuthMiddleware.validUser, userController.updateAccount);

// Change password
router
  .route("/account/changePassword")
  .get(
    userAuthMiddleware.checkUserAuthenticated,
    userController.changePasswordPage
  )
  .post(userController.changePassword);

// Forget password
router
  .route("/forgetPassword")
  .get(userController.forgetPasswordPage)
  .post(userController.forgetPassword);

// Reset password
router
  .route("/resetPassword")
  .get(OTPMiddleware.checkOTPVerified, userController.resetPasswordPage)
  .post(userController.resetPassword);

export default router;
