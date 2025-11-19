import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OTPSchema = Schema(
  {
    email: {
      type: String,
      required: true,
    },
    OTP: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  { timeStamps: true }
);

OTPSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("otps", OTPSchema);

export default OTP;
