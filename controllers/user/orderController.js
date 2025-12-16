//services
import * as addressService from "../../services/addressServices.js";
import * as cartService from "../../services/cartServices.js";
import * as orderService from "../../services/orderServices.js";
import * as walletService from "../../services/walletService.js";
import * as transactionService from "../../services/transactionService.js";
import * as couponService from "../../services/couponServices.js";

//utils
import { verifyPayment } from "../../utils/razorpayPaymentVerify.js";
import { generateInvoice } from "../../utils/pdfUtils.js";

import { StatusCode } from "../../constants/statusCodes.js";

//razorpay
import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Controller to get checkout page
export const checkoutPage = async (req, res) => {
  try {
    let address = await addressService.viewAddress(req.userID);
    let cart = await cartService.getCart(req.userID);
    res.render("checkout", { address, cart });
  } catch (err) {
    console.error(err);
    return res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Something went wrong! Please try again." });
  }
};

// Controller to create checkout order
export const createCheckoutOrder = async (req, res) => {
  try {
    const {
      products,
      addressId,
      paymentMethod,
      basePrice,
      totalAmount,
      cartItemIds,
      discount,
      taxAmount,
      couponCodeIds, // Get coupon IDs from request
    } = req.body;

    // Validate Coupons
    if (couponCodeIds && couponCodeIds.length > 0) {
      const cart = await cartService.getCart(req.userID);
      if (cart) {
        let grossTotal = 0;
        let offerTotal = 0;
        cart.cartItems.forEach((item) => {
          grossTotal += item.productID.price * item.quantity;
          const offer = Math.max(
            item.productID.offer || 0,
            item.categoryID.offer || 0,
            item.subCategoryID.offer || 0
          );
          const discountAmount = Math.floor(
            ((item.productID.price * offer) / 100) * item.quantity
          );
          offerTotal += discountAmount;
        });
        const netTotal = grossTotal - offerTotal;

        for (const couponId of couponCodeIds) {
          const couponEntry = cart.coupons.find(
            (c) => c.couponID._id.toString() === couponId
          );
          if (couponEntry) {
            const validation = couponService.validateCoupon(
              couponEntry.couponID,
              netTotal
            );
            if (!validation.isValid) {
              return res.status(StatusCode.BAD_REQUEST).json({
                error: `Coupon ${couponEntry.couponID.couponCode} is no longer valid: ${validation.error}`,
              });
            }
          }
        }
      }
    }

    // Payment method is cash on delivery
    if (paymentMethod == "COD") {
      const { success, order, error } = await orderService.createOrder(
        products,
        addressId,
        paymentMethod,
        basePrice,
        discount,
        taxAmount,
        totalAmount,
        req.userID
      );

      if (!success) {
        return res.status(StatusCode.BAD_REQUEST).json({ error });
      }

      await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);
      await cartService.removeCartCoupons(req.userID);
      return res
        .status(StatusCode.OK)
        .json({ success: true, successRedirect: "/" });
    }

    // Payment method is wallet
    if (paymentMethod == "Wallet") {
      const walletResult = await walletService.payFromWallet(
        req.userID,
        totalAmount
      );

      if (!walletResult.success) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ error: walletResult.error });
      }

      const orderResult = await orderService.createOrder(
        products,
        addressId,
        paymentMethod,
        basePrice,
        discount,
        taxAmount,
        totalAmount,
        req.userID
      );

      if (!orderResult.success) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ error: orderResult.error });
      }

      await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);
      await cartService.removeCartCoupons(req.userID);
      await orderService.completePayment(orderResult.order._id);
      await transactionService.completeTransaction(
        req.userID,
        totalAmount,
        "purchase",
        paymentMethod
      );

      return res
        .status(StatusCode.OK)
        .json({ success: true, successRedirect: "/" });
    }

    // Payment method is online payment
    const orderResult = await orderService.createOrder(
      products,
      addressId,
      paymentMethod,
      basePrice,
      discount,
      taxAmount,
      totalAmount,
      req.userID
    );

    if (!orderResult.success) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: orderResult.error });
    }

    await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);
    await cartService.removeCartCoupons(req.userID);

    const options = {
      amount: orderResult.order.totalAmmount * 100,
      currency: "INR",
    };

    const razorpayOrder = await new Promise((resolve, reject) => {
      razorpay.orders.create(options, (err, order) => {
        if (err) return reject(err);
        resolve(order);
      });
    });

    req.session.order = orderResult.order;
    req.session.cartItemIds = cartItemIds;
    res.status(StatusCode.OK).json({ razorpayOrder });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

//checkout for pending payments
export const createCheckoutOrderForPendingPayment = async (req, res) => {
  try {
    const { orderID, paymentMethod, totalAmount } = req.query;

    //Payment method is wallet
    if (paymentMethod == "Wallet") {
      const result = await walletService.payFromWallet(req.userID, totalAmount);

      if (!result.success) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: result.error });
      }

      await orderService.completePayment(orderID);
      await transactionService.completeTransaction(
        req.userID,
        totalAmount,
        "purchase",
        paymentMethod
      );

      return res
        .status(StatusCode.OK)
        .json({ success: true, successRedirect: "/" });
    }

    //Payment method is razorpay
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
    };

    const razorpayOrder = await new Promise((resolve, reject) => {
      razorpay.orders.create(options, (err, order) => {
        if (err) return reject(err);
        resolve(order);
      });
    });

    req.session.order = {
      _id: orderID,
      totalAmmount: totalAmount,
      paymentMethod,
    };
    res.status(StatusCode.OK).json({ razorpayOrder });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to complete payment order
export const completePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const { _id, totalAmmount: totalAmount, paymentMethod } = req.session.order;

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (isValid) {
      await orderService.completePayment(_id);
      await transactionService.completeTransaction(
        req.userID,
        totalAmount,
        "purchase",
        paymentMethod
      );
    }

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/order");
  }
};

// Controller to apply coupon discount
export const addCouponDiscount = async (req, res) => {
  try {
    const { totalAmount, couponCode } = req.body;

    const result = await couponService.applyCouponDiscount(
      totalAmount,
      couponCode,
      req.userID
    );

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.error });
    }

    req.session.couponDiscount = req.session.couponDiscount
      ? req.session.couponDiscount + result.discount
      : req.session.couponDiscount;

    return res.status(StatusCode.OK).json({
      success: true,
      couponDiscount: result.discount,
      couponID: result._id,
      couponCode,
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to get available coupon list
export const getAvailableCoupon = async (req, res) => {
  try {
    const totalAmount = req.params.id;

    // Fetch user's cart to get applied coupons
    const cart = await cartService.getCart(req.userID);
    const appliedCouponIds =
      cart && cart.coupons ? cart.coupons.map((c) => c.couponID._id) : [];

    const availableCouponList = await couponService.getAvailableCouponList(
      totalAmount,
      appliedCouponIds
    );
    return res
      .status(StatusCode.OK)
      .json({ success: true, availableCouponList });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to cancel an order
export const cancelOrder = async (req, res) => {
  try {
    const { productID, productQuantity, amountPaid } = req.body;
    const orderProductsID = req.params.id;
    const { paymentMethod, paymentStatus, additionalCharge } =
      await orderService.cancelOrders(
        orderProductsID,
        req.userID,
        productID,
        productQuantity
      );

    if (
      (paymentMethod == "Razorpay" || paymentMethod == "Wallet") &&
      paymentStatus == "completed"
    ) {
      await transactionService.completeTransaction(
        req.userID,
        amountPaid + additionalCharge,
        "refund"
      );
      await walletService.addToWallet(
        req.userID,
        amountPaid + additionalCharge
      );
    }
    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

export const returnProduct = async (req, res) => {
  try {
    const { returnReason } = req.body;

    const orderProductsID = req.params.id;
    await orderService.returnOrders(req.userID, orderProductsID, returnReason);

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

export const invoiceDownload = async (req, res) => {
  try {
    const orderID = req.params.id;
    const { order } = await orderService.getOrder(orderID);
    generateInvoice(req, res, order);
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to get applied coupons and validate them
export const getAppliedCoupons = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.userID);
    if (!cart) {
      return res
        .status(StatusCode.OK)
        .json({ success: true, appliedCoupons: [], totalCouponDiscount: 0 });
    }

    // Calculate total amount (gross) and offer total
    let grossTotal = 0;
    let offerTotal = 0;

    cart.cartItems.forEach((item) => {
      grossTotal += item.productID.price * item.quantity;

      // Calculate offer
      const offer = Math.max(
        item.productID.offer || 0,
        item.categoryID.offer || 0,
        item.subCategoryID.offer || 0
      );

      const discountAmount = Math.floor(
        ((item.productID.price * offer) / 100) * item.quantity
      );
      offerTotal += discountAmount;
    });

    const netTotal = grossTotal - offerTotal;

    const validCoupons = [];
    let totalCouponDiscount = 0;
    const couponsToRemove = [];

    if (cart.coupons && cart.coupons.length > 0) {
      for (const couponEntry of cart.coupons) {
        const coupon = couponEntry.couponID;
        // Validate
        const validation = couponService.validateCoupon(coupon, netTotal);

        if (validation.isValid) {
          validCoupons.push(coupon);
          totalCouponDiscount += coupon.discountAmount;
        } else {
          if (coupon) {
            couponsToRemove.push(coupon._id);
          }
        }
      }
    }

    // Remove invalid coupons
    if (couponsToRemove.length > 0) {
      for (const couponId of couponsToRemove) {
        await couponService.removeCoupon(req.userID, couponId);
      }
    }

    return res.status(StatusCode.OK).json({
      success: true,
      appliedCoupons: validCoupons,
      totalCouponDiscount,
      removedCoupons: couponsToRemove.length > 0,
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to remove coupon
export const removeCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await couponService.removeCoupon(req.userID, couponID);
    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
