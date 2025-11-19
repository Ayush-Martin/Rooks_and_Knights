//collections
import userCollection from "../models/userModel.js";

export const userList = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = { isAdmin: false };

  //for search user
  if (search) {
    findQuery["$or"] = [
      { username: { $regex: new RegExp(search, "i") } },
      { email: { $regex: new RegExp(search, "i") } },
    ];
  }

  try {
    let totalNoOfList = await userCollection.countDocuments(findQuery);
    let userList = await userCollection
      .find(findQuery)
      .skip(skipPages)
      .limit(noOfList);

    return { userList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

export const blockUnblockUser = async (userID) => {
  try {
    const user = await userCollection.findById(userID);
    await userCollection.updateOne(
      { _id: userID },
      { isblocked: !user.isblocked }
    );
  } catch (err) {
    console.log(err);
  }
};
