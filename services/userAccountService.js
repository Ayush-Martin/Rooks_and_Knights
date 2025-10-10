const { USER_RESPONSE_MESSAGE } = require("../constants/responseMessages");
const { STATUS_CODES } = require("../constants/statusCodes");
const userCollection = require("../models/userModel");

exports.viewUserProfile = async (_id) => {
  try {
    let userProfile = await userCollection.findById(_id);
    return userProfile;
  } catch (err) {
    console.log(err);
  }
};

/**
 * Service function to update user profile
 * - check the phone number is unique
 * - update user profile
 * @param {*} username
 * @param {*} phoneNumber
 * @param {*} _id
 * @returns
 */
exports.updateUserProfile = async (username, phoneNumber, _id) => {
  let anotherUser = await userCollection.findOne({
    _id: { $ne: _id },
    phoneNumber,
  });
  if (anotherUser) {
    return {
      success: false,
      statusCode: STATUS_CODES.CONFLICT,
      message: USER_RESPONSE_MESSAGE.PHONE_NUMBER_ALREADY_EXISTS,
    };
  }
  await userCollection.updateOne({ _id }, { username, phoneNumber });

  return { success: true };
};
