//models
import couponCollection from "../models/couponModel.js";

export const couponList = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = {};

  if (search) {
    findQuery.couponName = {
      $regex: new RegExp(search, "i"),
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  try {
    const totalNoOfList = await couponCollection.countDocuments(findQuery);
    const couponList = await couponCollection
      .find(findQuery)
      .skip(skipPages)
      .limit(noOfList);
    return { couponList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

export const addCoupon = async (
  couponName,
  couponCode,
  discountAmount,
  minimumOrderAmount,
  expiryDate
) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  try {
    const coupon = await couponCollection.findOne({
      $or: [{ couponName }, { couponCode }],
    });

    if (coupon) {
      return "coupon code or name aldready exist";
    }

    const newCoupon = new couponCollection({
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate,
    });

    await newCoupon.save();
  } catch (err) {
    console.log(err);
  }
};

export const deleteCoupon = async (couponID) => {
  try {
    await couponCollection.deleteOne({ _id: couponID });
  } catch (err) {
    console.log(err);
  }
};

export const editCoupon = async (
  couponID,
  couponName,
  couponCode,
  discountAmount,
  minimumOrderAmount,
  expiryDate
) => {
  try {
    const coupon = await couponCollection.findOne({
      $or: [{ couponName }, { couponCode }],
      _id: { $ne: couponID },
    });

    if (coupon) {
      return "coupon code or name aldready exist";
    }

    await couponCollection.updateOne(
      { _id: couponID },
      { couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate }
    );
  } catch (err) {
    console.log(err);
  }
};
