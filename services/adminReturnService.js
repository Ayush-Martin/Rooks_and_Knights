import orderCollection from "../models/orderModel.js";
import productCollection from "../models/productsModel.js";

// Service to get returns list with pagenation
export const getReturnsList = async (currentPage, noOfList, skipPages) => {
  const filter = {
    products: {
      $elemMatch: {
        returnStatus: { $ne: "notRequested" },
      },
    },
  };

  const totalNoOfList = await orderCollection.countDocuments(filter);

  const returnList = await orderCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skipPages)
    .limit(noOfList)
    .populate("userID")
    .populate("products.productID");

  return { returnList, currentPage, totalNoOfList };
};

// Service to approve or reject return
export const approveRejectReturn = async (
  orderID,
  orderItemID,
  returnStatus,
  productID,
  quantity
) => {
  await orderCollection.updateOne(
    { _id: orderID, "products._id": orderItemID },
    { "products.$.returnStatus": returnStatus }
  );

  if (returnStatus == "approved") {
    await productCollection.updateOne(
      { _id: productID },
      { $inc: { stock: quantity } }
    );
  }
};
