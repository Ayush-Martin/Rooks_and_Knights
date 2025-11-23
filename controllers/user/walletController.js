//services
import * as walletService from "../../services/walletService.js";
import * as transitionService from "../../services/transactionService.js";

//utils
import { verifyPayment } from "../../utils/razorpayPaymentVerify.js";

//razorpay
import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Controller for wallet page
export const walletPage = async (req, res) => {
  try {
    const wallet = await walletService.getWalletList(req.userID);
    const transitionList = await transitionService.transactionsList(req.userID);

    res.render("wallet", { wallet, transitionList });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to add amount to wallet
export const addAmountToWallet = async (req, res) => {
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
      res.status(StatusCode.OK).json({ razorpayOrder });
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to complete payment
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
      res.status(StatusCode.BAD_REQUEST).json({ error: "payment not valid" });
    }

    await walletService.addToWallet(
      req.userID,
      req.session.razorpayOrderAmount
    );
    await transitionService.completeTransaction(
      req.userID,
      req.session.razorpayOrderAmount,
      "walletRecharge",
      "Razorpay"
    );
    res.status(StatusCode.OK).json({
      success: true,
      successRedirect: `/wallet`,
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
