//models
import transactionCollection from "../models/transactionModel.js";

// Service to get transactions list for user
export const transactionsList = async (userID) => {
  const transactionList = await transactionCollection
    .find({ userID })
    .sort({ createdAt: -1 });
  return transactionList;
};

// Service to get all transactions list
export const allTransactionsList = async (currentPage, noOfList, skipPages) => {
  const totalNoOfList = await transactionCollection.countDocuments();

  const transactionList = await transactionCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(skipPages)
    .limit(noOfList)
    .populate("userID");

  return { transactionList, currentPage, totalNoOfList };
};

// Service to complete transaction
export const completeTransaction = async (
  userID,
  amount,
  transactionType,
  paymentMethod
) => {
  const newTransaction = new transactionCollection({
    userID,
    amount,
    transationType: transactionType,
    paymentMethod,
  });

  await newTransaction.save();
};
