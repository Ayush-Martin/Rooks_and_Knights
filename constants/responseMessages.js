const GENERAL_RESPONSE_MESSAGE = Object.freeze({
  INTERNAL_SERVER_ERROR: "Internal Server Error",
});

const AUTH_RESPONSE_MESSAGE = Object.freeze({
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  NOT_LOGGED_IN: "You must login first to continue",
  BLOCKED: "You are blocked",
});

module.exports = { GENERAL_RESPONSE_MESSAGE, AUTH_RESPONSE_MESSAGE };
