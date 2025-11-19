//requring modules
import passport from "passport";

//services
import * as userSevice from "../services/userService.js";
import * as accountService from "../services/userAccountService.js";
import * as resetPasswordServices from "../services/resetPasswordServices.js";
import * as addressService from "../services/addressServices.js";
import * as orderService from "../services/orderServices.js";
import * as walletService from "../services/walletService.js";
import * as transationService from "../services/transationService.js";

//utils
import generateAccessToken from "../utils/JWTUtils.js";
import signupFormValidataion from "../utils/registerValidation.js";

//GET login
export const getLogin = (req, res) => {
  res.render("user/login");
};

//POST login
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userData = await userSevice.findUserByEmail(email);

    if (!userData) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (userData.isblocked) {
      return res.status(400).json({ error: "You are bocked by admin" });
    }

    const isValidPassword = await userSevice.validateUserCredentials(
      password,
      userData.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const accessToken = generateAccessToken(email, userData._id);

    res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

//POST logout
export const postLogout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, successRedirect: "/" });
};

//GET Register
export const getRegister = (req, res) => {
  req.session.referalID = req.query.referalID;

  res.render("user/register");
};

//POST Register
export const postRegister = async (req, res) => {
  try {
    const { username, email, phoneNumber, password, confirmPassword } =
      req.body;

    const validationError = signupFormValidataion(
      username,
      email,
      password,
      confirmPassword
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    let result = await userSevice.registerUser(
      username,
      email,
      phoneNumber,
      password,
      req
    );

    if (!result.success) {
      // Inform user of the error
      return res.status(400).json({ error: result.message });
    }
    req.session.OTPVerificationRedirect = "/user/completeRegister";
    // Send success response with redirect URL
    res
      .status(200)
      .json({ success: true, successRedirect: result.redirectUrl });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

//GET complete register
export const getCompleteRegister = (req, res) => {
  res.render("user/completeRegister");
};

//POST complete register
export const postCompleteRegister = async (req, res) => {
  const { username, email, phoneNumber, password, referalID } = req.session;

  const result = await userSevice.saveUserToDB(
    username,
    email,
    phoneNumber,
    password
  );

  if (referalID) {
    const referedUserID = await userSevice.findUserByReferenceID(referalID);

    if (referedUserID) {
      await walletService.referal(referedUserID);
      await transationService.completeTransation(referedUserID, 50, "referal");
    }
  }

  if (result.success) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }

      res.clearCookie();
      res.redirect("/user/login");
    });
  } else {
    console.log("error while complete registration");
  }
};

//google auth
export const getGoogleCallback = (req, res) => {
  const accessToken = generateAccessToken(req.user.email, req.user._id);

  res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });

  res.send(`
            <script>
                window.location.href = '/user/account';
            </script>
        `);
};

//render forgot password
export const getForgetPassword = (req, res) => {
  res.render("user/forgetPassword");
};

//get email for forget password
export const postForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let error = await resetPasswordServices.forgetPassword(email, req);

    if (error) {
      return res.json({ error });
    }
    req.session.OTPVerificationRedirect = "/user/resetPassword";
    res.redirect("/OTP/verifyOTP");
  } catch (err) {
    console.log(err);
  }
};

//render reset password page
export const getResetPassword = (req, res) => {
  res.render("user/resetPassword");
};

//handle reset  password
export const postResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res
      .status(500)
      .json({ error: "Server error. Please try again later." });
  }

  if (password != confirmPassword) {
    return res
      .status(400)
      .json({ error: "password and confirmPassword doesnot match" });
  }

  try {
    await resetPasswordServices.resetPassword(
      password,
      req.userID || req.session.userID
    );

    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Server error. Please try again later." });
      }
      res.clearCookie("token");

      res.status(200).json({ success: true, successRedirect: "/user/login" });
    });
  } catch (err) {
    console.log(err);
  }
};

export const getAccount = async (req, res) => {
  try {
    const userProfile = await accountService.viewUserProfile(req.userID);
    const address = await addressService.viewAddress(req.userID);
    const orders = await orderService.viewOrders(req.userID);
    res.render("account", { userProfile, address, orders });
  } catch (err) {
    console.log(err);
  }
};

export const putAccount = async (req, res) => {
  try {
    const { username, phoneNumber } = req.body;
    let error = await accountService.updateUserProfile(
      username,
      phoneNumber,
      req.userID
    );
    if (error) {
      return res.status(400).json({ success: false, error: error.error });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
  }
};

export const postAccountChangePassword = async (req, res) => {
  try {
    let error = await resetPasswordServices.forgetPassword(req.email, req);

    if (error) {
      return res.json({ success: false, error });
    }
    req.session.userID = req.userID;
    req.session.OTPVerificationRedirect = "/user/resetPassword";
    res.status(200).json({ success: true, redirectUrl: "/OTP/verifyOTP" });
  } catch (err) {
    console.log(err);
  }
};
