const { OTP_ROUTES, USER_ROUTES } = require("../constants/routes");

/**
 * Middleware to check if OTP is verified
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.checkOTPVerified = (req, res, next) => {
  if (!req.session.isOTPVerified) {
    return res.redirect(OTP_ROUTES.VERIFY_OTP);
  }
  next();
};

/**
 * Middleware to check if user has entered his email before verifying OTP
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.isEmailEntered = (req, res, next) => {
  if (!req.session.email) {
    return res.redirect(USER_ROUTES.LOGIN);
  }
  next();
};
