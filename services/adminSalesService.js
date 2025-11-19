//models
import orderCollection from "../models/orderModel.js";
import * as dateFns from "date-fns";

export const salesList = async (
  reportType,
  startDate,
  endDate,
  currentPage,
  noOfList,
  skipPages
) => {
  const findQuery = {};

  const today = new Date();

  if (reportType === "custom") {
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);

    findQuery.createdAt = {
      $gte: startDate,
      $lt: endDate,
    };
  } else if (reportType != "all") {
    switch (reportType) {
      case "daily":
        startDate = dateFns.startOfDay(today);
        endDate = dateFns.endOfDay(today);

        break;

      case "weekly":
        startDate = dateFns.startOfWeek(today);
        endDate = dateFns.endOfWeek(today);

        break;

      case "monthly":
        startDate = dateFns.startOfMonth(today);
        endDate = dateFns.endOfMonth(today);

        break;
      case "yearly":
        startDate = dateFns.startOfYear(today);
        endDate = dateFns.endOfYear(today);

        break;
    }

    findQuery.createdAt = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  try {
    const totalProductsCount = await orderCollection.aggregate([
      { $unwind: "$products" },
      { $count: "totalProducts" },
    ]);

    const totalNoOfList =
      totalProductsCount.length > 0 ? totalProductsCount[0].totalProducts : 0;

    const orderList = await orderCollection.find(findQuery);

    const salesList = await orderCollection.aggregate([
      { $match: findQuery },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productID",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: skipPages },
      { $limit: noOfList },
    ]);

    return { salesList, orderList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

export const downloadSalesReport = async (reportType, startDate, endDate) => {
  const findQuery = {};

  const today = new Date();

  if (reportType === "custom") {
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);

    findQuery.createdAt = {
      $gte: startDate,
      $lt: endDate,
    };
  } else if (reportType != "all") {
    switch (reportType) {
      case "daily":
        startDate = dateFns.startOfDay(today);
        endDate = dateFns.endOfDay(today);

        break;

      case "weekly":
        startDate = dateFns.startOfWeek(today);
        endDate = dateFns.endOfWeek(today);

        break;

      case "monthly":
        startDate = dateFns.startOfMonth(today);
        endDate = dateFns.endOfMonth(today);

        break;
      case "yearly":
        startDate = dateFns.startOfYear(today);
        endDate = dateFns.endOfYear(today);

        break;
    }

    findQuery.createdAt = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  try {
    const salesList = await orderCollection.aggregate([
      { $match: findQuery },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productID",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return salesList;
  } catch (err) {
    console.log(err);
  }
};
