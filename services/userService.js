//Requiring modules
import userCollection from "../models/userModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import * as passwordUtils from "../utils/passwordUtils.js";
import crypto from "crypto";

export const registerUser = async (
  username,
  email,
  phoneNumber,
  password,
  req
) => {
  try {
    // Check if email already exists
    const emailExistAlready = await userCollection.findOne({ email });
    if (emailExistAlready) {
      return { success: false, message: "Email already exists" };
    }

    // Check if phone number already exists
    const phoneNumberExistAlready = await userCollection.findOne({
      phoneNumber,
    });
    if (phoneNumberExistAlready) {
      return { success: false, message: "Phone Number already exists" };
    }

    // Store user data in session
    req.session.username = username;
    req.session.email = email;
    req.session.phoneNumber = phoneNumber;
    req.session.password = password;
    req.session.save();

    // Generate and store OTP
    const OTP = OTPUtils.generateOTP();
    req.session.countdownTime = 30;

    await OTPUtils.storeOTP(email, OTP);

    // Send OTP
    try {
      await OTPUtils.sendOTP(email, OTP);
    } catch (otpError) {
      console.error("Failed to send OTP:", otpError);
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      };
    }

    // Start countdown
    OTPUtils.startCountdown(req);

    // Return success result
    return { success: true, redirectUrl: "/OTP/verifyOTP" };
  } catch (err) {
    console.error("Registration error:", err);
    return { success: false, message: "Server error. Please try again later." };
  }
};

export const saveUserToDB = async (username, email, phoneNumber, password) => {
  try {
    const hashedPassword = await passwordUtils.passwordHasher(password);

    // Create a new user instance
    const user = new userCollection({
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      referalID: crypto.randomBytes(16).toString("hex"),
    });

    // Save the user to the database
    await user.save();

    return { success: true };
  } catch (err) {
    console.error("Error during registration:", err);
    return {
      success: false,
      error: "Registration failed. Please try again later.",
    };
  }
};

export const findUserByEmail = async (email) => {
  return await userCollection.findOne({ email });
};

export const validateUserCredentials = async (password, userPasswordHash) => {
  return await passwordUtils.comparePassword(password, userPasswordHash);
};

export const findUserByReferenceID = async (referalID) => {
  try {
    return await userCollection.findOne({ referalID });
  } catch (err) {
    console.log(err);
  }
};
