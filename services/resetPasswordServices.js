import userCollection from "../models/userModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import { passwordHasher } from "../utils/passwordUtils.js";

export const forgetPassword = async (email, req) => {
  try {
    let user = await userCollection.findOne({ email });
    if (!user) {
      return "user doesnot exist";
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
      return "Failed to send OTP. Please try again.";
    }

    // Start countdown
    OTPUtils.startCountdown(req);
  } catch (err) {
    console.log(err);
  }
};

export const resetPassword = async (password, _id) => {
  try {
    const hasedPassword = await passwordHasher(password);
    await userCollection.updateOne({ _id }, { password: hasedPassword });
  } catch (err) {
    console.log(err);
  }
};
