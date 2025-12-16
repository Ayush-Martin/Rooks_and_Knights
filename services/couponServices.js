//models
import couponCollection from "../models/couponModel.js";
import cartCollection from "../models/cartModel.js";

// Service to apply coupon discount
export const applyCouponDiscount = async (totalAmount, couponCode, userID) => {
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

  await cartCollection.updateOne(
    { userID },
    { $push: { coupons: { couponID: coupon._id } } }
  );

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

// Service to validate a coupon
export const validateCoupon = (coupon, totalAmount) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!coupon) {
    return { isValid: false, error: "Coupon not found" };
  }

  if (new Date(coupon.expiryDate) < now) {
    return { isValid: false, error: "Coupon expired" };
  }

  if (totalAmount < coupon.minimumOrderAmount) {
    return {
      isValid: false,
      error: `Total amount must be at least ${coupon.minimumOrderAmount}`,
    };
  }

  return { isValid: true };
};

// Service to remove coupon from cart
export const removeCoupon = async (userID, couponID) => {
  await cartCollection.updateOne(
    { userID },
    { $pull: { coupons: { couponID: couponID } } }
  );
};
