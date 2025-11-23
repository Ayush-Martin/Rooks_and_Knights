import * as adminCouponService from "../../services/adminCouponServices.js";

import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render coupons page
export const couponsPage = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { couponList, totalNoOfList } = await adminCouponService.couponList(
      search,
      currentPage,
      noOfList,
      skipPages
    );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
    res.render("admin/coupons", {
      couponList,
      currentPage,
      totalNoOfPages,
      searchFilter: search || null,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to add coupon
export const addCoupon = async (req, res) => {
  try {
    const {
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate,
    } = req.body;
    const result = await adminCouponService.addCoupon(
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate
    );

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.error });
    }

    res.status(StatusCode.OK).json({ success: true, coupon: result.coupon });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await adminCouponService.deleteCoupon(couponID);
    return res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to edit coupon
export const editCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    const {
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate,
    } = req.body;

    const result = await adminCouponService.editCoupon(
      couponID,
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate
    );
    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.error });
    }

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
