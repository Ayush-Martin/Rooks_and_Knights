import mongoose from "mongoose";
const Schema = mongoose.Schema;

const transationSchema = Schema(
  {
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transationType: {
      type: String,
      enum: [
        "purchase",
        "walletRecharge",
        "walletDeduction",
        "refund",
        "referal",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Wallet"],
    },
  },
  { timestamps: true }
);

const transation = mongoose.model("transations", transationSchema);

export default transation;
