import mongoose from "mongoose";

const Schema = mongoose.Schema;

//user schema
const userShema = Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
    },

    googleID: {
      type: String,
      unique: true,
      sparse: true,
    },

    isblocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    referalID: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userShema);
export default User;
