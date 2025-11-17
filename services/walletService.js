//models
const walletCollection = require("../models/walletModel");
const userCollection = require("../models/userModel");

//render walletList
exports.walletList = async (userID) => {
  try {
    const wallet = await walletCollection.findOne({ userID });

    if (!wallet) {
      const newWallet = new walletCollection({
        userID,
      });

      await newWallet.save();
      return newWallet;
    }
    return wallet;
  } catch (err) {
    console.log(err);
  }
};

//add money to wallet
exports.addToWallet = async (userID, amount) => {
  try {
    console.log(userID, amount);
    await walletCollection.updateOne({ userID }, { $inc: { balance: amount } });
  } catch (err) {
    console.log(err);
  }
};

//pay form wallet
exports.payFromWallet = async (userID, amount) => {
  try {
    const wallet = await walletCollection.findOne({ userID });

    if (!wallet) {
      //checks for wallet exist
      const newWallet = new walletCollection({
        userID,
      });

      await newWallet.save();
      return "Not enought money in wallet";
    }

    if (wallet.balance < amount) {
      //checks if wallet have enough balance
      return "Not enought money in wallet";
    }

    wallet.balance -= amount;

    await wallet.save();
  } catch (err) {
    console.log(err);
  }
};

//add referal amount to user wallet
exports.referal = async (referedUserID) => {
  try {
    await walletCollection.updateOne(
      { userID: referedUserID },
      { $inc: { balance: 50 } }
    );
  } catch (err) {
    console.log(err);
  }
};
