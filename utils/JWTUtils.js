import jwt from "jsonwebtoken";

function generateAccessToken(email, _id) {
  return jwt.sign({ email, _id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

export default generateAccessToken;
