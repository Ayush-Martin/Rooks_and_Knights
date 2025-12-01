import productCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";

// Service to get products with pagenation , filter and search
export const productList = async (
  categoryID,
  sortby,
  price,
  subCategoryID,
  search,
  currentPage,
  noOfProducts,
  skipPages
) => {
  const categoryList = await categoryCollection.find({ isListed: true });
  const subCategoryList = await subCategoryCollection.find({ isListed: true });

  const listedCatIDs = categoryList.map((x) => x._id);
  const listedSubCatIDs = subCategoryList.map((x) => x._id);

  const findQuery = {
    isListed: true,
    subCategoryID: { $in: listedSubCatIDs },
    categoryID: { $in: listedCatIDs },
  };

  if (categoryID) {
    findQuery.categoryID = categoryID;
  }

  if (subCategoryID) {
    findQuery.subCategoryID = subCategoryID;
  }

  if (search) {
    findQuery.productName = {
      $regex: new RegExp(search, "i"), // Partial match with case-insensitivity
    };
  }

  switch (price) {
    case "0-1000":
      findQuery.price = { $gte: 0, $lt: 1000 };
      break;
    case "1000-2000":
      findQuery.price = { $gte: 1000, $lt: 2000 };
      break;
    case "2000-3000":
      findQuery.price = { $gte: 2000, $lt: 3000 };
      break;
    case "3000-4000":
      findQuery.price = { $gte: 3000, $lt: 4000 };
      break;
    case "4000+":
      findQuery.price = { $gte: 4000 };
      break;
  }

  const sortQuery = {};
  switch (sortby) {
    case "newArrivals":
      sortQuery.createdAt = -1;
      break;
    case "priceLowToHeigh":
      sortQuery.price = 1;
      break;
    case "priceHeighToLow":
      sortQuery.price = -1;
      break;
    case "aA-zZ":
      sortQuery.productName = 1;
      break;
    case "zZ-aA":
      sortQuery.productName = -1;
      break;
  }

  const totalNoOfProducts = await productCollection.countDocuments(findQuery);

  const productList = await productCollection
    .find(findQuery)
    .populate("categoryID")
    .populate("subCategoryID")
    .collation({ locale: "en", strength: 2 })
    .sort(sortQuery)
    .skip(skipPages)
    .limit(noOfProducts);
  return { productList, categoryList, subCategoryList, totalNoOfProducts };
};

// Service to get product data and related products
export const getProduct = async (_id, userID) => {
  const product = await productCollection
    .findById(_id)
    .populate({
      path: "categoryID",
    })
    .populate({
      path: "subCategoryID",
    })
    .populate({
      path: "reviews.userID",
    })
    .exec();

  const relatedProducts = await productCollection.find({
    isListed: true,
    categoryID: product.categoryID._id,
    _id: { $ne: product._id },
  });

  return { product, relatedProducts };
};

// Service to add review
export const addReview = async (_id, newReview) => {
  await productCollection.updateOne({ _id }, { $push: { reviews: newReview } });
};
