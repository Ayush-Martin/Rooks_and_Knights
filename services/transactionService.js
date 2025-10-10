//models
const transactionCollection = require("../models/transactionModel");

exports.transactionsList = async (userID) => {
  try {
    const transactionList = await transactionCollection
      .find({ userID })
      .sort({ createdAt: -1 });
    return transactionList;
  } catch (err) {
    console.log(err);
  }
};

exports.allTransactionsList = async (currentPage, noOfList, skipPages) => {
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

/**
 * Service function to create transaction
 * @param {*} userID
 * @param {*} amount
 * @param {*} transactionType
 * @param {*} paymentMethod
 */
exports.completeTransaction = async (
  userID,
  amount,
  transactionType,
  paymentMethod
) => {
  const newTransaction = new transactionCollection({
    userID,
    amount,
    transactionType,
    paymentMethod,
  });

  await newTransaction.save();
};
