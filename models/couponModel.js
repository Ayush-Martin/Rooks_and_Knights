import mongoose from "mongoose";
const Schema = mongoose.Schema;

const couponSchema = Schema(
  {
    couponName: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    minimumOrderAmount: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const coupon = mongoose.model("coupons", couponSchema);

export default coupon;
