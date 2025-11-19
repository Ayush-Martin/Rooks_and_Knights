//models
import transationCollection from "../models/transationModel.js";

export const transationsList = async (userID) => {
  try {
    const transationList = await transationCollection
      .find({ userID })
      .sort({ createdAt: -1 });
    return transationList;
  } catch (err) {
    console.log(err);
  }
};

export const allTransationsList = async (currentPage, noOfList, skipPages) => {
  try {
    const totalNoOfList = await transationCollection.countDocuments();

    const transationList = await transationCollection
      .find()
      .sort({ createdAt: -1 })
      .skip(skipPages)
      .limit(noOfList)
      .populate("userID");

    return { transationList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

export const completeTransation = async (
  userID,
  amount,
  transationType,
  paymentMethod
) => {
  try {
    const newTransation = new transationCollection({
      userID,
      amount,
      transationType,
      paymentMethod,
    });

    await newTransation.save();
  } catch (err) {
    console.log(err);
  }
};
