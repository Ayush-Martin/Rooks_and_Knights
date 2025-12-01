//models
import couponCollection from "../models/couponModel.js";

// Service to get coupon list with search and pagenation
export const couponList = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = {};

  if (search) {
    findQuery.couponName = {
      $regex: new RegExp(search, "i"),
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const totalNoOfList = await couponCollection.countDocuments(findQuery);
  const couponList = await couponCollection
    .find(findQuery)
    .skip(skipPages)
    .limit(noOfList);
  return { couponList, currentPage, totalNoOfList };
};

// Service to add new coupon
export const addCoupon = async (
  couponName,
  couponCode,
  discountAmount,
  minimumOrderAmount,
  expiryDate
) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const coupon = await couponCollection.findOne({
    $or: [{ couponName }, { couponCode }],
  });

  if (coupon) {
    return { success: false, error: "coupon code or name already exist" };
  }

  const newCoupon = new couponCollection({
    couponName,
    couponCode,
    discountAmount,
    minimumOrderAmount,
    expiryDate,
  });

  await newCoupon.save();
  return { success: true, coupon: newCoupon };
};

// Service to delete coupon
export const deleteCoupon = async (couponID) => {
  await couponCollection.deleteOne({ _id: couponID });
};

// Service to edit coupon
export const editCoupon = async (
  couponID,
  couponName,
  couponCode,
  discountAmount,
  minimumOrderAmount,
  expiryDate
) => {
  const coupon = await couponCollection.findOne({
    $or: [{ couponName }, { couponCode }],
    _id: { $ne: couponID },
  });

  if (coupon) {
    return { success: false, error: "coupon code or name already exist" };
  }

  await couponCollection.updateOne(
    { _id: couponID },
    { couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate }
  );

  return { success: true };
};
