const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = Schema(
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
    transactionType: {
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

const transaction = mongoose.model("transactions", transactionSchema);

module.exports = transaction;
