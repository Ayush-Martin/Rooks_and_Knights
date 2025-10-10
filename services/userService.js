const {
  USER_RESPONSE_MESSAGE,
  OTP_RESPONSE_MESSAGE,
  GENERAL_RESPONSE_MESSAGE,
} = require("../constants/responseMessages");
const { OTP_ROUTES } = require("../constants/routes");
const { STATUS_CODES } = require("../constants/statusCodes");
const userCollection = require("../models/userModel");
const OTPUtils = require("../utils/OTPUtils");
const passwordUtils = require("../utils/passwordUtils");
const crypto = require("crypto");

/**
 * Service function to register user
 * - checks if email or phone number already exists
 * - stores user data in session
 * - generates and stores OTP
 * - sends OTP
 * - starts OTP countdown
 * @param {*} username
 * @param {*} email
 * @param {*} phoneNumber
 * @param {*} password
 * @param {*} req
 * @returns
 */
exports.registerUser = async (username, email, phoneNumber, password, req) => {
  try {
    const emailExistAlready = await userCollection.findOne({ email });
    if (emailExistAlready) {
      return {
        success: false,
        message: USER_RESPONSE_MESSAGE.EMAIL_ALREADY_EXISTS,
        statusCode: STATUS_CODES.CONFLICT,
      };
    }

    const phoneNumberExistAlready = await userCollection.findOne({
      phoneNumber,
    });
    if (phoneNumberExistAlready) {
      return {
        success: false,
        message: USER_RESPONSE_MESSAGE.PHONE_NUMBER_ALREADY_EXISTS,
        statusCode: STATUS_CODES.CONFLICT,
      };
    }

    req.session.username = username;
    req.session.email = email;
    req.session.phoneNumber = phoneNumber;
    req.session.password = password;
    req.session.save();

    const OTP = OTPUtils.generateOTP();
    req.session.countdownTime = 30;

    await OTPUtils.storeOTP(email, OTP);

    try {
      await OTPUtils.sendOTP(email, OTP);
    } catch (otpError) {
      return {
        success: false,
        message: OTP_RESPONSE_MESSAGE.FAILED_OTP_SEND,
        statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      };
    }

    OTPUtils.startCountdown(req);

    return { success: true, redirectUrl: OTP_ROUTES.VERIFY_OTP };
  } catch (err) {
    return {
      success: false,
      message: GENERAL_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Method to create a new user in the database
 * - hashes the password
 * - saves the user to the database
 * @param {*} username
 * @param {*} email
 * @param {*} phoneNumber
 * @param {*} password
 * @returns
 */
exports.saveUserToDB = async (username, email, phoneNumber, password) => {
  try {
    const hashedPassword = await passwordUtils.passwordHasher(password);

    const user = new userCollection({
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      referalID: crypto.randomBytes(16).toString("hex"), // generating radom referal id for this user
    });

    await user.save();

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: GENERAL_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Method to get the user data from the database by email
 * @param {*} email
 * @returns
 */
exports.findUserByEmail = async (email) => {
  return await userCollection.findOne({ email });
};

/**
 * Method to validate user credentials
 * - compares the password entered by the user with the hashed password stored in the database
 * @param {*} password
 * @param {*} userPasswordHash
 * @returns
 */
exports.validateUserCredentials = async (password, userPasswordHash) => {
  return await passwordUtils.comparePassword(password, userPasswordHash);
};

/**
 * Service function to find user by referalID
 * @param {*} referalID
 * @returns
 */
exports.findUserByReferenceID = async (referalID) => {
  return await userCollection.findOne({ referalID });
};
