const { OTP_RESPONSE_MESSAGE } = require("../constants/responseMessages");
const { STATUS_CODES } = require("../constants/statusCodes");
const userCollection = require("../models/userModel");
const OTPUtils = require("../utils/OTPUtils");
const { hashPassword, passwordHasher } = require("../utils/passwordUtils");

/**
 * Service function to forget password
 * - check user exists
 * - generate and store OTP
 * - send OTP
 * - start OTP countdown
 * @param {*} email
 * @param {*} req
 * @returns
 */
exports.forgetPassword = async (email, req) => {
  let user = await userCollection.findOne({ email });
  if (!user) {
    return {
      success: false,
      statusCode: STATUS_CODES.NOT_FOUND,
      message: USER_RESPONSE_MESSAGE.USER_NOT_FOUND,
    };
  }

  // Generate and store OTP
  const OTP = OTPUtils.generateOTP();
  req.session.countdownTime = 30;
  req.session.email = email;
  req.session.userID = user._id;

  await OTPUtils.storeOTP(email, OTP);

  // Send OTP
  try {
    await OTPUtils.sendOTP(email, OTP);
  } catch (otpError) {
    console.error("Failed to send OTP:", otpError);
    return {
      success: false,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: OTP_RESPONSE_MESSAGE.FAILED_OTP_SEND,
    };
  }

  // Start countdown
  OTPUtils.startCountdown(req);

  return { success: true };
};

/**
 * Service function to reset password
 * - hash password
 * - update password
 * @param {*} password
 * @param {*} _id
 */
exports.resetPassword = async (password, _id) => {
  const hashedPassword = await passwordHasher(password);
  await userCollection.updateOne({ _id }, { password: hashedPassword });
};
