//models
import walletCollection from "../models/walletModel.js";

// Service to get wallet list
export const getWalletList = async (userID) => {
  const wallet = await walletCollection.findOne({ userID });

  if (!wallet) {
    const newWallet = new walletCollection({
      userID,
    });

    await newWallet.save();
    return newWallet;
  }
  return wallet;
};

// Service to add money to wallet
export const addToWallet = async (userID, amount) => {
  await walletCollection.updateOne({ userID }, { $inc: { balance: amount } });
};

// Service to pay from wallet
export const payFromWallet = async (userID, amount) => {
  const wallet = await walletCollection.findOne({ userID });

  if (!wallet) {
    //checks for wallet exist
    const newWallet = new walletCollection({
      userID,
    });

    await newWallet.save();
    return { success: false, error: "Not enough money in wallet" };
  }

  if (wallet.balance < amount) {
    //checks if wallet have enough balance
    return { success: false, error: "Not enough money in wallet" };
  }

  wallet.balance -= amount;

  await wallet.save();
  return { success: true, newBalance: wallet.balance };
};

// Service to add referal amount to user wallet
export const referal = async (referredUserID) => {
  const updatedWallet = await walletCollection.findOneAndUpdate(
    { userID: referredUserID },
    { $inc: { balance: 50 } },
    {
      upsert: true,
      returnDocument: "after", // ensures updated wallet returned
      setDefaultsOnInsert: true,
    }
  );

  return {
    success: true,
    newBalance: updatedWallet.balance,
  };
};
