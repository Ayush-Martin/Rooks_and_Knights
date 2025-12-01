import userCollection from "../models/userModel.js";
import OTPCollection from "../models/OTPModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import { passwordHasher } from "../utils/passwordUtils.js";

/**
 * Service function for forget password
 * - check if the user is valid
 * - generate and store OTP
 * - send the otp
 */
export const forgetPassword = async (email, req) => {
  const user = await userCollection.findOne({ email });
  if (!user) {
    return {
      success: false,
      message: "User does not exist",
    };
  }

  req.session.email = email;
  req.session.userID = user._id;

  // Generate and store OTP
  const OTP = OTPUtils.generateOTP();

  const expires = new Date(
    Date.now() + process.env.OTP_EXPIRY_MINUTES * 60 * 1000
  );

  try {
    await OTPCollection.findOneAndUpdate(
      { email },
      { email, OTP, expires },
      { upsert: true, new: true }
    );

    await OTPUtils.sendOTP(email, OTP);
  } catch (error) {
    console.error("Failed to send OTP:", error);
    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    };
  }

  return { success: true };
};

// Service function to update password
export const resetPassword = async (password, _id) => {
  const hashedPassword = await passwordHasher(password);
  await userCollection.updateOne({ _id }, { password: hashedPassword });
};
