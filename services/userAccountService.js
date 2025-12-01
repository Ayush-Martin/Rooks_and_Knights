import userCollection from "../models/userModel.js";

// Service to get the user data based on user ID
export const viewUserProfile = async (_id) => {
  let userProfile = await userCollection.findById(_id);
  return userProfile;
};

// Service to update the user profile
export const updateUserProfile = async (username, phoneNumber, _id) => {
  let anotherUser = await userCollection.findOne({
    _id: { $ne: _id },
    phoneNumber,
  });
  if (anotherUser) {
    return { success: false, error: "Phone number already exist" };
  }
  const updatedUser = await userCollection.findOneAndUpdate(
    { _id },
    { username, phoneNumber },
    { new: true }
  );
  return { success: true, user: updatedUser };
};
