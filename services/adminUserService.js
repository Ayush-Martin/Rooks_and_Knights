//collections
import userCollection from "../models/userModel.js";

// Service to get users list with pagination and search
export const getUsers = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = { isAdmin: false };

  if (search) {
    findQuery["$or"] = [
      { username: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
    ];
  }

  let totalNoOfList = await userCollection.countDocuments(findQuery);
  let userList = await userCollection
    .find(findQuery)
    .skip(skipPages)
    .limit(noOfList);

  return { userList, currentPage, totalNoOfList };
};

// Service to block or unblock user
export const blockUnblockUser = async (userID, isblocked) => {
  await userCollection.updateOne({ _id: userID }, { isblocked: isblocked });
};
