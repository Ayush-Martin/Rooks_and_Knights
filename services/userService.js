//Requiring modules
import userCollection from "../models/userModel.js";
import OTPCollection from "../models/OTPModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import * as passwordUtils from "../utils/passwordUtils.js";
import crypto from "crypto";

/**
 * Service function for registration
 * - checks if the email / phone number is already taken
 * - store the details to session
 * - generate and store OTP
 */
export const registerUser = async (
  username,
  email,
  phoneNumber,
  password,
  req
) => {
  const emailExistAlready = await userCollection.findOne({ email });
  if (emailExistAlready) {
    return { success: false, message: "Email already exists" };
  }

  const phoneNumberExistAlready = await userCollection.findOne({
    phoneNumber,
  });
  if (phoneNumberExistAlready) {
    return { success: false, message: "Phone Number already exists" };
  }

  // Storing user data in session for complete registration after OTP verification
  req.session.username = username;
  req.session.email = email;
  req.session.phoneNumber = phoneNumber;
  req.session.password = password;
  req.session.save();

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

  return { success: true, redirectUrl: "/OTP/verifyOTP" };
};

/**
 * Service function for complete registration
 * - hash the password
 * - create and store user to db
 */
export const saveUserToDB = async (username, email, phoneNumber, password) => {
  const hashedPassword = await passwordUtils.passwordHasher(password);

  const user = new userCollection({
    username,
    password: hashedPassword,
    email,
    phoneNumber,
    referalID: crypto.randomBytes(16).toString("hex"),
  });

  await user.save();

  return { success: true };
};

// Service function which returns user data based on the email
export const findUserByEmail = async (email) => {
  return await userCollection.findOne({ email });
};

// Service function to check whether the entered password is valid
export const validateUserCredentials = async (password, userPasswordHash) => {
  return await passwordUtils.comparePassword(password, userPasswordHash);
};

// Service function to get the user data by his referalId
export const findUserByReferenceID = async (referalID) => {
  try {
    return await userCollection.findOne({ referalID });
  } catch (err) {
    console.log(err);
  }
};
