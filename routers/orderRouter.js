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
  orderController.createCheckoutOrderForPendingPayment
);
router.patch(
  "/cancel/:id",
  userAuthMiddleware.validUser,
  orderController.cancelOrder
);
router.patch(
  "/return/returnProduct/:id",
  userAuthMiddleware.validUser,
  orderController.returnProduct
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
  orderController.addCouponDiscount
);

//coupon list
router.get(
  "/coupon/:id",
  userAuthMiddleware.validUser,
  orderController.getAvailableCoupon
);

//download Invoice pdf
router.get(
  "/downloadInvoicePdf/:id",
  userAuthMiddleware.checkUserAuthenticated,
  orderController.invoiceDownload
);

export default router;
