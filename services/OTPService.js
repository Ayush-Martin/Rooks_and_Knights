import OTPCollection from "../models/OTPModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";

// Service to verify OTP
export const verifyOTP = async (email, OTP) => {
  const record = await OTPCollection.findOne({ email });

  if (!record) return { success: false, message: "OTP not found" };

  if (Date.now() > record.expires) {
    await OTPCollection.deleteOne({ email });
    return { success: false, message: "OTP Expired" };
  }

  if (record.OTP === OTP) {
    await OTPCollection.deleteOne({ email });
    return { success: true, message: "OTP verified" };
  }

  return { success: false, message: "Invalid OTP" };
};

// Service to resend OTP
export const resendOTP = async (email) => {
  const OTP = OTPUtils.generateOTP();

  const expires = new Date(
    Date.now() + process.env.OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await OTPCollection.findOneAndUpdate(
    { email },
    { email, OTP, expires },
    { upsert: true, new: true }
  );

  await OTPUtils.sendOTP(email, OTP);
};
