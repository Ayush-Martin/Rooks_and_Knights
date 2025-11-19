//services
import * as walletService from "../services/walletService.js";
import * as transationService from "../services/transactionService.js";

//utils
import { verifyPayment } from "../utils/razorpayPaymentVerify.js";

//razorpay
import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//display wallet page
export const getWallet = async (req, res) => {
  try {
    const wallet = await walletService.walletList(req.userID);
    const transationList = await transationService.transationsList(req.userID);

    res.render("wallet", { wallet, transationList });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//add amount to wallet
export const postWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
    };

    razorpay.orders.create(options, (err, razorpayOrder) => {
      if (err) {
        console.log(err);
      }
      req.session.razorpayOrderAmount = amount;
      res.status(200).json({ razorpayOrder });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//payment completion for adding money to wallet using razorpay
export const completePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );
    if (!isValid) {
      res.json({ error: "payment not valid" });
    }

    await walletService.addToWallet(
      req.userID,
      req.session.razorpayOrderAmount
    );
    await transationService.completeTransation(
      req.userID,
      req.session.razorpayOrderAmount,
      "walletRecharge",
      "Razorpay"
    );
    res.redirect("/wallet");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};
