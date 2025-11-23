//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as orderController from "../controllers/user/orderController.js";

//middlewares
import * as userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

router.get(
  "/",
  userAuthMiddleware.checkUserAuthenticated,
  orderController.checkoutPage
);
router.post(
  "/proceedToPayment",
  userAuthMiddleware.validUser,
  orderController.createCheckoutOrder
);
router.post(
  "/pendingProceedToPayment",
  userAuthMiddleware.validUser,
  orderController.postPendingCheckout
);
router.patch(
  "/cancel/:id",
  userAuthMiddleware.validUser,
  orderController.patchCancel
);
router.patch(
  "/return/returnProduct/:id",
  userAuthMiddleware.validUser,
  orderController.patchReturn
);

router.post(
  "/completePayment",
  userAuthMiddleware.checkUserAuthenticated,
  orderController.completePayment
);

//add coupon
router.post(
  "/coupon",
  userAuthMiddleware.validUser,
  orderController.postAddCouponDiscount
);

//coupon list
router.get(
  "/coupon/:id",
  userAuthMiddleware.validUser,
  orderController.getAvaliableCoupon
);

//download Invoice pdf
router.get(
  "/downloadInvoicePdf/:id",
  userAuthMiddleware.checkUserAuthenticated,
  orderController.invoiceDownload
);

export default router;
