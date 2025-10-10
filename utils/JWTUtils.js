const jwt = require("jsonwebtoken");

/**
 * Function to generate access token with payload email and _id
 * @param {*} email
 * @param {*} _id
 * @returns
 */
function generateAccessToken(email, _id) {
  return jwt.sign({ email, _id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = generateAccessToken;
