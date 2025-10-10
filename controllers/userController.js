const passport = require("passport");
const userService = require("../services/userService");
const accountService = require("../services/userAccountService");
const resetPasswordServices = require("../services/resetPasswordServices");
const addressService = require("../services/addressServices");
const orderService = require("../services/orderServices");
const walletService = require("../services/walletService");
const transactionService = require("../services/transactionService");
const generateAccessToken = require("../utils/JWTUtils");
const signupFormValidation = require("../utils/registerValidation");
const { STATUS_CODES } = require("../constants/statusCodes");
const {
  USER_RESPONSE_MESSAGE,
  AUTH_RESPONSE_MESSAGE,
  GENERAL_RESPONSE_MESSAGE,
} = require("../constants/responseMessages");
const { PUBLIC_ROUTES, OTP_ROUTES } = require("../constants/routes");
const { ACCESS_TOKEN_NAME } = require("../constants/general");
const { USER_ROUTES } = require("../constants/routes");

// ---- PAGE RENDERING ---- //

/**
 * Controller to render login page
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.loginPage = (req, res) => {
  res.render("user/login");
};

/**
 * Controller to render register page
 * @param {*} req
 * @param {*} res
 */
exports.registerPage = (req, res) => {
  req.session.referalID = req.query.referalID;

  res.render("user/register");
};

/**
 * Controller to render complete register page
 * @param {*} req
 * @param {*} res
 */
exports.completeRegisterPage = (req, res) => {
  res.render("user/completeRegister");
};

/**
 * Controller to render forget password page
 * @param {*} req
 * @param {*} res
 */
exports.forgetPasswordPage = (req, res) => {
  res.render("user/forgetPassword");
};

/**
 * Controller to render reset password page
 * @param {*} req
 * @param {*} res
 */
exports.resetPasswordPage = (req, res) => {
  res.render("user/resetPassword");
};

/**
 * Controller to render account page
 * - get user profile , address and orders details
 * - pass them to account page and render
 * @param {*} req
 * @param {*} res
 */
exports.accountPage = async (req, res) => {
  try {
    const userProfile = await accountService.viewUserProfile(req.userID);
    const address = await addressService.viewAddress(req.userID);
    const orders = await orderService.viewOrders(req.userID);
    res.render("account", { userProfile, address, orders });
  } catch (err) {
    console.log(err);
  }
};

// ---- LOGIC ---- //

/**
 * Controller to login user
 * - validate user credentials
 * - check if user is blocked
 * - generate access token and set cookie
 * - redirect to home page
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: GENERAL_RESPONSE_MESSAGE.ALL_DATA_REQUIRED });
    }

    const userData = await userService.findUserByEmail(email);

    if (!userData) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: USER_RESPONSE_MESSAGE.USER_NOT_FOUND });
    }

    if (userData.isblocked) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ error: AUTH_RESPONSE_MESSAGE.USER_BLOCKED });
    }

    const isValidPassword = await userService.validateUserCredentials(
      password,
      userData.password
    );

    if (!isValidPassword) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: AUTH_RESPONSE_MESSAGE.INVALID_CREDENTIALS });
    }

    const accessToken = generateAccessToken(email, userData._id);

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.redirect(PUBLIC_ROUTES.HOME);
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to logout user
 * - clear token from cookie
 * - redirect to home page
 * @param {*} req
 * @param {*} res
 */
exports.logout = (req, res) => {
  res.clearCookie(ACCESS_TOKEN_NAME);
  res
    .status(STATUS_CODES.OK)
    .json({ success: true, successRedirect: PUBLIC_ROUTES.HOME });
};

/**
 * Controller to register user
 * - calls registerUser service and redirect
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.register = async (req, res, next) => {
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
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: validationError });
    }

    let result = await userService.registerUser(
      username,
      email,
      phoneNumber,
      password,
      req
    );

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.message });
    }

    req.session.OTPVerificationRedirect = USER_ROUTES.COMPLETE_REGISTER;

    res
      .status(STATUS_CODES.OK)
      .json({ success: true, successRedirect: result.redirectUrl });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to complete user registration
 * - save user to database
 * - If referal id is present add referal amount to the refered user
 * - redirect to login page
 * @param {*} req
 * @param {*} res
 */
exports.completeRegister = async (req, res, next) => {
  try {
    const { username, email, phoneNumber, password, referalID } = req.session;

    const result = await userService.saveUserToDB(
      username,
      email,
      phoneNumber,
      password
    );

    if (referalID) {
      const referedUserID = await userService.findUserByReferenceID(referalID);

      if (referedUserID) {
        await walletService.referal(referedUserID);
        await transactionService.completeTransaction(
          referedUserID,
          50,
          "referal"
        );
      }
    }

    if (result.success) {
      // If registration is successful, destroy session data stored in memory
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }

        res.clearCookie();
        res.redirect(USER_ROUTES.LOGIN);
      });
    } else {
      res.status(result.statusCode).json({ error: result.message });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to handle google callback
 * @param {*} req
 * @param {*} res
 */
exports.googleCallback = (req, res) => {
  const accessToken = generateAccessToken(req.user.email, req.user._id);

  res.cookie(ACCESS_TOKEN_NAME, accessToken, {
    httpOnly: true,
    sameSite: "Strict",
  });

  res.send(`
            <script>
                window.location.href = '${PUBLIC_ROUTES.HOME}';
            </script>
        `);
};

/**
 * Controller to handle forget password
 * - calls forgetPassword service
 * - redirect to OTP page
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    let result = await resetPasswordServices.forgetPassword(email, req);

    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.message });
    }
    req.session.OTPVerificationRedirect = USER_ROUTES.RESET_PASSWORD;

    res.redirect(OTP_ROUTES.VERIFY_OTP);
  } catch (err) {
    next(err);
  }
};
/**
 * Controller to handle reset password
 * - check password and confirm password
 * - calls resetPassword service
 * - redirect to login
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: GENERAL_RESPONSE_MESSAGE.ALL_DATA_REQUIRED });
    }

    if (password != confirmPassword) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: AUTH_RESPONSE_MESSAGE.PASSWORDS_DO_NOT_MATCH });
    }

    await resetPasswordServices.resetPassword(
      password,
      req.userID || req.session.userID
    );

    req.session.destroy((err) => {
      if (err) {
        next(err);
      }
      res.clearCookie(ACCESS_TOKEN_NAME);

      res
        .status(200)
        .json({ success: true, successRedirect: USER_ROUTES.LOGIN });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to handle update account
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateAccount = async (req, res, next) => {
  try {
    const { username, phoneNumber } = req.body;
    let result = await accountService.updateUserProfile(
      username,
      phoneNumber,
      req.userID
    );
    if (!result.success) {
      return res
        .status(result.statusCode)
        .json({ success: false, error: result.message });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to handle change password
 * - calls forgetPassword service
 * - redirect to OTP page
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.changePassword = async (req, res, next) => {
  try {
    let result = await resetPasswordServices.forgetPassword(req.email, req);

    if (!result.success) {
      return res.json({ success: false, error: result.message });
    }
    req.session.userID = req.userID;
    req.session.OTPVerificationRedirect = USER_ROUTES.RESET_PASSWORD;
    res
      .status(STATUS_CODES.OK)
      .json({ success: true, redirectUrl: OTP_ROUTES.VERIFY_OTP });
  } catch (err) {
    next(err);
  }
};
