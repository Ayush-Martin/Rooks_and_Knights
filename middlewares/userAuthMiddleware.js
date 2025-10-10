const userCollection = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../constants/statusCodes");
const {
  GENERAL_RESPONSE_MESSAGE,
  AUTH_RESPONSE_MESSAGE,
} = require("../constants/responseMessages");
const { USER_ROUTES, PUBLIC_ROUTES } = require("../constants/routes");

/**
 * Middleware to check whether the user authenticated **FOR PAGE GET REQUEST**
 * - get jwt token from cookies
 * - validate the token
 * - check user is blocked
 * - store user email and userId and proceeds with the next
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkUserAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(STATUS_CODES.UNAUTHORIZED).redirect(USER_ROUTES);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(STATUS_CODES.FORBIDDEN).redirect(USER_ROUTES.LOGIN);
      }

      req.email = user.email;
      req.userID = user._id;

      // get stored user data from db
      let userData = await userCollection.findOne({ email: req.email });

      // Check if the user is blocked
      if (userData && userData.isblocked) {
        return res.status(STATUS_CODES.FORBIDDEN).redirect(USER_ROUTES.LOGIN);
      }

      next();
    });
  } catch (err) {
    console.log(err);
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(GENERAL_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Middleware to check whether the user authenticated **FOR ACTION REQUEST OTHER THAN GETTING PAGE**
 * - get jwt token from cookies
 * - validate the token
 * - check user is blocked
 * - store user email and userId and proceeds with the next
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.validUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        authError: AUTH_RESPONSE_MESSAGE.NOT_LOGGED_IN,
        errorRedirect: `<a href="${USER_ROUTES.LOGIN}">Login here</a>`,
      });
    }

    // Verify JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        //If Invalid Token
        return res.status(STATUS_CODES.FORBIDDEN).json({
          authError: AUTH_RESPONSE_MESSAGE.NOT_LOGGED_IN,
          errorRedirect: `<a href="${USER_ROUTES.LOGIN}">Login here</a>`,
        });
      }

      req.email = user.email;
      req.userID = user._id;

      let userData = await userCollection.findOne({ email: req.email });

      // Check if the user is blocked
      if (userData.isblocked) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          error: AUTH_RESPONSE_MESSAGE.BLOCKED,
          errorRedirect: `<a href="${USER_ROUTES.LOGIN}">Login here</a>`,
        });
      }

      next();
    });
  } catch (err) {
    console.log(err);
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: GENERAL_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR });
  }
};

// Middleware for routes where the user should NOT be authenticated
/**
 * Middleware to check if user already authenticated (For routes where user should be redirected if authenticated ex:"login , register")
 * - get jwt token from cookies
 * - validate the token
 * - check user is blocked
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkUserAlreadyAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        // If token is invalid
        return next();
      }

      req.email = user.email;

      let userExist = await userCollection.findOne({ email: req.email });

      // Check if user is blocked
      if (userExist && userExist.isblocked) {
        return next();
      }

      // User is authenticated and not blocked, redirect to the home page
      res.redirect(PUBLIC_ROUTES.HOME);
    });
  } catch (err) {
    console.log(err);
    return next();
  }
};

/**
 * Middleware to store userId and email if authenticated (Used in public routes where no need to run auth middleware and have some functionality if authenticated ex:"In product detail page if user is logged in show the status of the wishlist")
 * - get jwt token from cookies
 * - validate the token (if valid store the email and userId in session)
 * - proceed with next
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    // Verify JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return next();
      }

      req.email = user.email;
      req.userID = user._id;

      next();
    });
  } catch (err) {
    console.log(err);
    return res.redirect(PUBLIC_ROUTES.ERROR);
  }
};
