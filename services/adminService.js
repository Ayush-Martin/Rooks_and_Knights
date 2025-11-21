//Requiring modules
import userCollection from "../models/userModel.js";
import * as OTPUtils from "../utils/OTPUtils.js";
import * as passwordUtils from "../utils/passwordUtils.js";

//Service to find admin by email
export const findAdminByEmail = async (email) => {
  const admin = await userCollection.findOne({ email, isAdmin: true });
  return admin;
};

//Service to validate admin credentials
export const validateAdminCredentials = async (password, adminPasswordHash) => {
  return await passwordUtils.comparePassword(password, adminPasswordHash);
};
