//models
import couponCollection from "../models/couponModel.js";

// Service to apply coupon discount
export const applyCouponDiscount = async (totalAmount, couponCode) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const coupon = await couponCollection.findOne({ couponCode });

  if (!coupon) {
    return { success: false, error: "coupon not found" };
  }

  if (coupon.expiryDate < now) {
    return { success: false, error: "coupon expired" };
  }

  if (totalAmount < coupon.minimumOrderAmount) {
    return {
      success: false,
      error: `To use this coupon there must me total amount of ${coupon.minimumOrderAmount}`,
    };
  }

  return { success: true, discount: coupon.discountAmount, _id: coupon._id };
};

// Service to get available coupon list
export const getAvailableCouponList = async (totalAmount) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const availableCouponList = await couponCollection.find({
    minimumOrderAmount: { $lte: totalAmount },
    expiryDate: { $gte: now },
  });
  return availableCouponList;
};
