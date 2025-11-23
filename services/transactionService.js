//models
import transactionCollection from "../models/transactionModel.js";

// Service to get transactions list
export const transactionsList = async (userID) => {
  try {
    const transactionList = await transactionCollection
      .find({ userID })
      .sort({ createdAt: -1 });
    return transactionList;
  } catch (err) {
    console.log(err);
  }
};

export const allTransactionsList = async (currentPage, noOfList, skipPages) => {
  try {
    const totalNoOfList = await transactionCollection.countDocuments();

    const transactionList = await transactionCollection
      .find()
      .sort({ createdAt: -1 })
      .skip(skipPages)
      .limit(noOfList)
      .populate("userID");

    return { transactionList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

export const completeTransaction = async (
  userID,
  amount,
  transactionType,
  paymentMethod
) => {
  try {
    const newTransaction = new transactionCollection({
      userID,
      amount,
      transationType: transactionType,
      paymentMethod,
    });

    await newTransaction.save();
  } catch (err) {
    console.log(err);
  }
};
