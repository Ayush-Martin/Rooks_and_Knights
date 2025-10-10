const GENERAL_RESPONSE_MESSAGE = Object.freeze({
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  ALL_DATA_REQUIRED: "All data is required",
});

const AUTH_RESPONSE_MESSAGE = Object.freeze({
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  NOT_LOGGED_IN: "You must login first to continue",
  BLOCKED: "You are blocked",
  INVALID_CREDENTIALS: "Incorrect credentials",
  PASSWORDS_DO_NOT_MATCH: "Password and confirm password do not match",
});

const OTP_RESPONSE_MESSAGE = Object.freeze({
  INVALID_OTP: "Invalid OTP",
  FAILED_OTP_SEND: "Failed to send OTP please try again",
});

const USER_RESPONSE_MESSAGE = Object.freeze({
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  PHONE_NUMBER_ALREADY_EXISTS: "Phone number already exists",
});

module.exports = {
  GENERAL_RESPONSE_MESSAGE,
  AUTH_RESPONSE_MESSAGE,
  OTP_RESPONSE_MESSAGE,
  USER_RESPONSE_MESSAGE,
};
