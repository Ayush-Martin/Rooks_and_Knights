const orderCollection = require("../models/orderModel");
const productCollection = require("../models/productsModel");
const addressCollection = require("../models/addressModel");
const categoryCollection = require("../models/CategoryModel");
const subCategoryCollection = require("../models/subCategoryModel");
const couponCollection = require("../models/couponModel");

exports.createOrder = async (
  products,
  addressId,
  paymentMethod,
  couponCodes,
  userID
) => {
  try {
    const address = await addressCollection.findOne({
      userID,
      "address._id": addressId,
    });
    const productIDs = products.map((product) => product.productID);
    const orderedProducts = await productCollection
      .find({ _id: { $in: productIDs } })
      .populate("categoryID")
      .populate("subCategoryID");

    if (orderedProducts.some((product) => product.isListed == false)) {
      return { error: "product does not exist" };
    }

    const coupons = await couponCollection.find({ _id: { $in: couponCodes } });

    let discount = 0;
    let basePrice = 0;
    const couponDiscount = coupons.reduce(
      (discount, coupon) => discount + coupon.discountAmount,
      0
    );

    for (let i = 0; i < products.length; i++) {
      basePrice += parseInt(orderedProducts[i].price * products[i].quantity);
      discount += parseInt(
        (orderedProducts[i].price *
          Math.max(
            orderedProducts[i].offer,
            orderedProducts[i].subCategoryID.offer,
            orderedProducts[i].categoryID.offer
          ) *
          products[i].quantity) /
          100
      );
    }

    discount += couponDiscount;

    const totalAmmount = basePrice - discount + 100;
    const taxAmmount = parseInt((totalAmmount * 2) / 100);

    const newOrder = new orderCollection({
      userID,
      address: address.address[0],
      products,
      paymentMethod,
      basePrice,
      totalAmmount,
      discount,
      taxAmmount,
    });

    for (const product of products) {
      const productDetails = await productCollection.findOneAndUpdate(
        { _id: product.productID },
        { $inc: { stock: -product.quantity, noOfOrders: 1 } }
      );

      await categoryCollection.updateOne(
        { _id: productDetails.categoryID },
        { $inc: { noOfOrders: 1 } }
      );
      await subCategoryCollection.updateOne(
        { _id: productDetails.subCategoryID },
        { $inc: { noOfOrders: 1 } }
      );
    }

    await newOrder.save();
    return { order: newOrder };
  } catch (err) {
    console.log(err);
  }
};

exports.completePayment = async (orderID) => {
  try {
    await orderCollection.updateOne(
      { _id: orderID },
      { paymentStatus: "completed" }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.viewOrders = async (userID) => {
  try {
    let orders = await orderCollection
      .find({ userID })
      .sort({ createdAt: -1 })
      .populate("products.productID");
    return orders;
  } catch (err) {
    console.log(err);
  }
};

exports.getOrder = async (orderID) => {
  try {
    const order = await orderCollection
      .findOne({ _id: orderID })
      .populate("userID")
      .populate("products.productID");

    return { order };
  } catch (err) {
    console.log(err);
  }
};

exports.cancelOrders = async (_id, userID, productID, productQuantity) => {
  try {
    let order = await orderCollection.findOneAndUpdate(
      { userID, "products._id": _id },
      { $set: { "products.$.status": "canceled" } },
      { new: true }
    );

    await productCollection.updateOne(
      { _id: productID },
      { $inc: { stock: productQuantity } }
    );
    const allCanceled = order.products.every(
      (product) => product.status === "canceled"
    );

    let additionlaCharge = 0;
    if (allCanceled) {
      order.orderStatus = "canceled";
      additionlaCharge += order.deliveryCharge;
      await order.save();
    }

    return {
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      additionlaCharge,
    };
  } catch (err) {
    console.log(err);
  }
};

exports.returnOrders = async (userID, orderProductId, returnReason) => {
  try {
    await orderCollection.updateOne(
      { userID, "products._id": orderProductId },
      {
        $set: {
          "products.$.returnStatus": "requested",
          "products.$.returnReason": returnReason,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};
