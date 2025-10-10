//Requiring modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

//Controllers
const userController = require("../controllers/userController");

//middlewares
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");
const OTPMiddleware = require("../middlewares/OTPMiddleware");

//Login
router
  .route("/login")
  .get(
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    userController.loginPage
  )
  .post(userController.login);
router.route("/logout").post(userController.logout);

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
    userAuthMiddleware.checkUserAlreadyAuthenticated,
    OTPMiddleware.checkOTPVerified,
    userController.completeRegisterPage
  )
  .post(userController.completeRegister);

//google Auth
router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router
  .route("/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/user/login" }),
    userController.googleCallback
  );

//User account route
router.get(
  "/account",
  userAuthMiddleware.checkUserAuthenticated,
  userController.accountPage
);
router.put(
  "/account/updateProfile",
  userAuthMiddleware.validUser,
  userController.updateAccount
);

router.post(
  "/account/changePassword",
  userAuthMiddleware.validUser,
  userController.changePassword
);

router
  .route("/forgetPassword")
  .get(userController.forgetPasswordPage)
  .post(userController.forgetPassword);

router
  .route("/resetPassword")
  .get(OTPMiddleware.checkOTPVerified, userController.resetPasswordPage)
  .post(userController.resetPassword);

module.exports = router;
