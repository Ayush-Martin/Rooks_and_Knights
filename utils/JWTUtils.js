import jwt from "jsonwebtoken";

// Function which will generate JWT token
function generateAccessToken(email, _id) {
  return jwt.sign({ email, _id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}
    
export default generateAccessToken;
