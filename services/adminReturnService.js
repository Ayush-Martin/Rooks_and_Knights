import orderCollection from "../models/orderModel.js";
import productCollection from "../models/productsModel.js";

export const returnsList = async (currentPage, noOfList, skipPages) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

export const aproveRejectReturn = async (
  orderID,
  orderItemID,
  returnStatus,
  productID,
  quantity
) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};
