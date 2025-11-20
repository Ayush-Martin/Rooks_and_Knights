//services
import * as userService from "../services/userService.js";
import * as accountService from "../services/userAccountService.js";
import * as resetPasswordServices from "../services/resetPasswordServices.js";
import * as addressService from "../services/addressServices.js";
import * as orderService from "../services/orderServices.js";
import * as walletService from "../services/walletService.js";
import * as transactionService from "../services/transactionService.js";

//utils
import generateAccessToken from "../utils/JWTUtils.js";
import signupFormValidation from "../utils/registerValidation.js";
import { StatusCode } from "../constants/statusCodes.js";

// Controller to get the login page
export const loginPage = (req, res) => {
  res.render("user/login");
};

//Controller to handle login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const userData = await userService.findUserByEmail(email);

    if (!userData) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "User does not exist" });
    }

    if (userData.isblocked) {
      return res
        .status(StatusCode.FORBIDDEN)
        .json({ error: "You are blocked by admin" });
    }

    const isValidPassword = await userService.validateUserCredentials(
      password,
      userData.password
    );

    if (!isValidPassword) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Incorrect password" });
    }

    const accessToken = generateAccessToken(email, userData._id);

    res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });
    res.status(StatusCode.OK).json({ successRedirect: "/" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};

//Controller to handle logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(StatusCode.OK).json({ success: true, successRedirect: "/" });
};

//Controller to get register page
export const registerPage = (req, res) => {
  req.session.referalID = req.query.referalID; //Storing the referal id if there is referalId in query
  res.render("user/register");
};

/**
 * Controller to handle registration
 * - Validate all details
 * - Calls registerUser service
 */
export const register = async (req, res) => {
  try {
    const { username, email, phoneNumber, password, confirmPassword } =
      req.body;

    const validationError = signupFormValidation(
      username,
      email,
      password,
      confirmPassword
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    let result = await userService.registerUser(
      username,
      email,
      phoneNumber,
      password,
      req
    );

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.message });
    }

    /**
     * Store a server session `OTPVerificationRedirect` , so that the server will know where
     * should the server should redirect the user to after the OTP verification
     */
    req.session.OTPVerificationRedirect = "/user/completeRegister";

    res
      .status(StatusCode.OK)
      .json({ success: true, successRedirect: result.redirectUrl });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error. Please try again later." });
  }
};

//Controller to get complete register page
export const completeRegisterPage = (req, res) => {
  res.render("user/completeRegister");
};

/**
 * Controller to handle complete registration
 * - Save the user to DB
 * - If the user was refered send commission to the refered user wallet
 */
export const completeRegister = async (req, res) => {
  try {
    const { username, email, phoneNumber, password, referalID } = req.session;

    const result = await userService.saveUserToDB(
      username,
      email,
      phoneNumber,
      password
    );

    if (referalID) {
      //Checking for stored referal ID
      const referedUserID = await userService.findUserByReferenceID(referalID);

      if (referedUserID) {
        // Sending Commission amount to the refered User
        await walletService.referal(referedUserID);
        await transactionService.completeTransaction(
          referedUserID,
          50,
          "referal"
        );
      }
    }

    if (result.success) {
      // Clear all session and cookies
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }

        res.clearCookie();
        res.redirect("/user/login");
      });
    } else {
      console.log("error while complete registration");
      res.redirect("/error");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/err");
  }
};

//google auth
export const googleCallback = (req, res) => {
  const accessToken = generateAccessToken(req.user.email, req.user._id);

  res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });

  res.send(`
            <script>
                window.location.href = '/user/account';
            </script>
        `);
};

// Controller to get the forget password page
export const forgetPasswordPage = (req, res) => {
  res.render("user/forgetPassword");
};

//Controller to handle forget password
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let result = await resetPasswordServices.forgetPassword(email, req);

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.message });
    }

    /**
     * Store a server session `OTPVerificationRedirect` , so that the server will know where
     * should the server should redirect the user to after the OTP verification
     */
    req.session.OTPVerificationRedirect = "/user/resetPassword";

    res.status(StatusCode.OK).json({ successRedirect: "/OTP/verifyOTP" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to get the reset password page
export const resetPasswordPage = (req, res) => {
  res.render("user/resetPassword");
};

//Controller to handle resetPassword password
export const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "Password and confirm password are required" });
  }

  if (password != confirmPassword) {
    return res
      .status(StatusCode.BAD_REQUEST)
      .json({ error: "password and confirmPassword does not match" });
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
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: "Server error. Please try again later." });
      }
      res.clearCookie("token");

      res
        .status(StatusCode.OK)
        .json({ success: true, successRedirect: "/user/login" });
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error. Please try again later." });
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

// Controller to get the change password page
export const changePasswordPage = (req, res) => {
  res.render("user/changePassword");
};

// Controller to handle change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userID = req.userID;

    if (!oldPassword || !newPassword) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Old password and new password are required" });
    }

    // Get user details to verify old password
    const user = await accountService.viewUserProfile(userID);

    if (!user) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "User not found" });
    }

    // Verify old password
    const isPasswordValid = await userService.validateUserCredentials(
      oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Incorrect old password" });
    }

    // Update to new password
    await resetPasswordServices.resetPassword(newPassword, userID);

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server error" });
  }
};
