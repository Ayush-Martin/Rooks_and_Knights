import userCollection from "../models/userModel.js";

export const viewUserProfile = async (_id) => {
  try {
    let userProfile = await userCollection.findById(_id);
    return userProfile;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserProfile = async (username, phoneNumber, _id) => {
  try {
    let anotherUser = await userCollection.findOne({
      _id: { $ne: _id },
      phoneNumber,
    });
    if (anotherUser) {
      return { error: "Phone number aldready exist" };
    }
    await userCollection.updateOne({ _id }, { username, phoneNumber });
  } catch (err) {
    console.log(err);
  }
};
