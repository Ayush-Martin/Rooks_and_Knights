//modules
import pdfKit from "pdfkit";

//services
import * as addressService from "../../services/addressServices.js";
import * as cartService from "../../services/cartServices.js";
import * as orderService from "../../services/orderServices.js";
import * as walletService from "../../services/walletService.js";
import * as transationService from "../../services/transactionService.js";
import * as couponService from "../../services/couponServices.js";

//utils
import { verifyPayment } from "../../utils/razorpayPaymentVerify.js";
import { generateInvoice } from "../../utils/pdfUtils.js";

//razorpay
import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//geting checkout page
export const getCheckout = async (req, res) => {
  try {
    let address = await addressService.viewAddress(req.userID);
    let cart = await cartService.viewCart(req.userID);
    res.render("checkout", { address, cart });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//creating order
export const postCheckout = async (req, res) => {
  try {
    const {
      products,
      addressId,
      paymentMethod,
      basePrice,
      totalAmmount,
      cartItemIds,
      discount,
      taxAmmount,
      couponCodeIds,
    } = req.body;

    //if cash on delivery
    if (paymentMethod == "COD") {
      const order = await orderService.createOrder(
        products,
        addressId,
        paymentMethod,
        couponCodeIds,
        req.userID
      );

      if (order.error) {
        return res.status(400).json({ error: order.error });
      }

      await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);
      return res.status(200).json({ success: true, successRedirect: "/" });
    }

    //if wallet
    if (paymentMethod == "Wallet") {
      const error = await walletService.payFromWallet(req.userID, totalAmmount);

      if (error) {
        return res.status(400).json({ error });
      }

      const order = await orderService.createOrder(
        products,
        addressId,
        paymentMethod,
        couponCodeIds,
        req.userID
      );

      if (order.error) {
        return res.status(400).json({ error: order.error });
      }

      await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);
      await orderService.completePayment(order.order._id);
      await transationService.completeTransation(
        req.userID,
        totalAmmount,
        "purchase",
        paymentMethod
      );

      return res.status(200).json({ success: true, successRedirect: "/" });
    }

    //if razorpay
    const order = await orderService.createOrder(
      products,
      addressId,
      paymentMethod,
      couponCodeIds,
      req.userID
    );

    if (order.error) {
      return res.status(400).json({ error: order.error });
    }

    await cartService.deleteManyCartItem(cartItemIds, basePrice, req.userID);

    const options = {
      amount: order.order.totalAmmount * 100,
      currency: "INR",
    };

    razorpay.orders.create(options, (err, razorpayOrder) => {
      if (err) {
        console.log(err);
      }

      req.session.order = order.order;
      req.session.cartItemIds = cartItemIds;
      res.status(200).json({ razorpayOrder });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//checkout for pending payemnts
export const postPendingCheckout = async (req, res) => {
  try {
    const { orderID, paymentMethod, totalAmmount } = req.query;

    //if wallet
    if (paymentMethod == "Wallet") {
      const error = await walletService.payFromWallet(req.userID, totalAmmount);

      if (error) {
        return res.status(400).json({ error });
      }

      await orderService.completePayment(orderID);
      await transationService.completeTransation(
        req.userID,
        totalAmmount,
        "purchase",
        paymentMethod
      );

      return res.status(200).json({ success: true, successRedirect: "/" });
    }

    //if razorpay
    const options = {
      amount: totalAmmount * 100,
      currency: "INR",
    };

    console.log(options);

    razorpay.orders.create(options, (err, razorpayOrder) => {
      if (err) {
        console.log(`razorpay error:`);
        console.log(err);
      }

      req.session.order = { _id: orderID, totalAmmount, paymentMethod };
      console.log(req.session.order, razorpayOrder);
      return res.status(200).json({ razorpayOrder });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//complete payment using razorpay
export const completePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const { _id, totalAmmount, paymentMethod } = req.session.order;

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (isValid) {
      await orderService.completePayment(_id);
      await transationService.completeTransation(
        req.userID,
        totalAmmount,
        "purchase",
        paymentMethod
      );
    }

    if (req.session.cartItemIds) {
      res.redirect("/");
    } else {
      res.redirect("/account");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//apply coupon
export const postAddCouponDiscount = async (req, res) => {
  try {
    const { totalAmount, couponCode } = req.body;

    const coupon = await couponService.addCouponDiscount(
      totalAmount,
      couponCode
    );

    if (coupon.error) {
      return res.status(400).json({ error: coupon.error });
    }

    req.session.couponDiscount = req.session.couponDiscount
      ? req.session.couponDiscount + coupon.discount
      : req.session.couponDiscount;

    return res.status(200).json({
      success: true,
      couponDiscount: coupon.discount,
      couponID: coupon._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//avaliable coupon list
export const getAvaliableCoupon = async (req, res) => {
  try {
    const totalAmmount = req.params.id;

    const avaliableCouponList = await couponService.avaliableCouponList(
      totalAmmount
    );
    return res.status(200).json({ success: true, avaliableCouponList });
  } catch (err) {
    console.log(err);
  }
};

//cancel an order
export const patchCancel = async (req, res) => {
  try {
    const { productID, productQuantity, amountPaid } = req.body;
    const orderProductsID = req.params.id;
    const { paymentMethod, paymentStatus, additionlaCharge } =
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
      await transationService.completeTransation(
        req.userID,
        amountPaid + additionlaCharge,
        "refund"
      );
      await walletService.addToWallet(
        req.userID,
        amountPaid + additionlaCharge
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//request for return
export const patchReturn = async (req, res) => {
  try {
    const { returnReason } = req.body;

    const orderProductsID = req.params.id;
    await orderService.returnOrders(req.userID, orderProductsID, returnReason);

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const invoiceDownload = async (req, res) => {
  try {
    const orderID = req.params.id;
    const { order } = await orderService.getOrder(orderID);
    generateInvoice(req, res, order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};
