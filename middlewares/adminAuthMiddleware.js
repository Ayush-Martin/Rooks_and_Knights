const jwt = require("jsonwebtoken");
const adminService = require("../services/adminService");
const { ADMIN_ROUTES } = require("../constants/routes");
const { STATUS_CODES } = require("../constants/statusCodes");

/**
 * Middleware to check whether the admin authenticated  and authorized **FOR PAGE GET REQUEST**
 * - get jwt token from cookies
 * - validate the token
 * - authorization check
 * - store the email in session and proceeds with the next
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkAdminAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).redirect(ADMIN_ROUTES.LOGIN);
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const adminData = await adminService.findUserByEmail(user.email);

    if (!adminData) {
      // Authorization check
      return res.status(STATUS_CODES.FORBIDDEN).redirect(ADMIN_ROUTES.LOGIN);
    }

    req.email = user.email;
    next();
  } catch (err) {
    console.log(err);
    return res.status(STATUS_CODES.FORBIDDEN).redirect(ADMIN_ROUTES.LOGIN);
  }
};

/**
 * Middleware to check whether the admin authenticated  and authorized **FOR ACTION REQUEST OTHER THAN GETTING PAGE**
 * - get jwt token from cookies
 * - validate the token
 * - authorization check
 * - store the email in session and proceeds with the next
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.validAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ validationError: true, redirectUrl: ADMIN_ROUTES.LOGIN });
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const adminData = await adminService.findUserByEmail(user.email);

    if (!adminData) {
      // Authorization check
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ validationError: true, redirectUrl: ADMIN_ROUTES.LOGIN });
    }

    req.email = user.email;
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ validationError: true, redirectUrl: ADMIN_ROUTES.LOGIN });
  }
};

/**
 * Middleware to check if admin already authenticated (For routes where admin should be redirected if authenticated ex:"login")
 * - get jwt token from cookies
 * - validate the token
 * - authorization check
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkAdminAlreadyAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.email = user.email;

    const adminData = await adminService.findUserByEmail(req.email);

    if (!adminData) {
      return next();
    }

    return res.redirect(ADMIN_ROUTES.DASHBOARD);
  } catch (err) {
    console.log(err);
    return next();
  }
};
