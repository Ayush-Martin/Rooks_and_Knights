import * as adminReturnService from "../../services/adminReturnService.js";
import * as walletService from "../../services/walletService.js";
import * as transactionService from "../../services/transactionService.js";

import { StatusCode } from "../../constants/statusCodes.js";

// Controller to display returns
export const returnsPage = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { returnList, totalNoOfList } =
      await adminReturnService.getReturnsList(currentPage, noOfList, skipPages);
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/returns", { returnList, currentPage, totalNoOfPages });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

export const approveRejectReturn = async (req, res) => {
  try {
    const {
      orderID,
      orderItemID,
      returnStatus,
      userID,
      amount,
      paymentMethod,
      productID,
      quantity,
    } = req.body;
    await adminReturnService.approveRejectReturn(
      orderID,
      orderItemID,
      returnStatus,
      productID,
      quantity
    );

    if (
      returnStatus == "approved" &&
      (paymentMethod == "Wallet" || paymentMethod == "Razorpay")
    ) {
      await walletService.addToWallet(userID, amount);
      await transactionService.completeTransaction(userID, amount, "refund");
    }

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
