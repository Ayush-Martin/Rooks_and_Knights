import productsCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";
import orderCollection from "../models/orderModel.js";

// Service to get top ten list
export const TopTenList = async () => {
  const topTenProductsList = await productsCollection
    .find({ isListed: true })
    .sort({ noOfOrders: -1 })
    .limit(10);

  const topTenCategoryList = await categoryCollection
    .find({ isListed: true })
    .sort({ noOfOrders: -1 })
    .limit(10);

  const topTenSubCategoryList = await subCategoryCollection
    .find({ isListed: true })
    .sort({ noOfOrders: -1 })
    .limit(10);

  return { topTenProductsList, topTenCategoryList, topTenSubCategoryList };
};

// Service to get daily sales
export const dailySales = async () => {
  const dailySales = await orderCollection.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  return dailySales;
};

// Service to get monthly sales
export const monthlySales = async () => {
  const monthlySales = await orderCollection.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return monthlySales;
};

// Service to get yearly sales
export const yearlySales = async () => {
  const yearlySales = await orderCollection.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
        }, // Group by year
        totalSales: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return yearlySales;
};
