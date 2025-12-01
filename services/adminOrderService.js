//models
import orderCollection from "../models/orderModel.js";
import productCollection from "../models/productsModel.js";

// Service to get all orders with pagenation
export const getOrders = async (currentPage, noOfList, skipPages) => {
  let totalNoOfList = await orderCollection.countDocuments();
  let orders = await orderCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(skipPages)
    .limit(noOfList)
    .populate("userID");
  return { orders, currentPage, totalNoOfList };
};

// Service to get a order detail by orderID
export const getOrder = async (orderID) => {
  const order = await orderCollection
    .findById(orderID)
    .populate("userID")
    .populate("products.productID");

  return { order };
};

// Service to change the productOrderStatus
export const changeProductStatus = async (
  productOrderID,
  orderID,
  status,
  productID,
  quantity
) => {
  let order = await orderCollection.findOneAndUpdate(
    { _id: orderID, "products._id": productOrderID },
    { $set: { "products.$.status": status, paymentStatus: "completed" } },
    { new: true }
  );

  if (status == "canceled") {
    await productCollection.updateOne(
      { _id: productID },
      { $inc: { stock: quantity } }
    );
  }

  const allCanceled = order.products.every(
    (product) => product.status == "canceled"
  );
  const allDelivered = order.products.every(
    (product) => product.status == "delivered"
  );

  if (allCanceled) {
    //if all products are canceled
    order.orderStatus = "canceled";
    await order.save();
  }

  if (allDelivered) {
    //if all products are delivered
    order.orderStatus = "delivered";
    await order.save();
  }
  return order;
};
