//Requiring modules
import userCollection from "../models/userModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import * as passwordUtils from "../utils/passwordUtils.js";

export const findUserByEmail = async (email) => {
  const admin = await userCollection.findOne({ email, isAdmin: true });
  return admin;
};

export const validateUserCredentials = async (password, userPasswordHash) => {
  //checks password and stored password same
  return await passwordUtils.comparePassword(password, userPasswordHash);
};
