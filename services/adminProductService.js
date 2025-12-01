//models
import productCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";

//requiring modules for saving the uploads
import fs from "node:fs";
import path from "node:path";

// Service to get Pagenated product list
export const getProducts = async (search, currentPage, noOfList, skipPages) => {
  const findQuery = {}; // Filter query object

  if (search) {
    findQuery.productName = {
      $regex: new RegExp(search, "i"),
    };
  }

  const totalNoOfList = await productCollection.countDocuments(findQuery);
  const productList = await productCollection
    .find(findQuery)
    .skip(skipPages)
    .limit(noOfList)
    .populate("categoryID")
    .populate("subCategoryID")
    .lean();

  return { productList, currentPage, totalNoOfList };
};

// Service to add new product
export const addProduct = async (req, res) => {
  const {
    productName,
    productDescription,
    productAbout,
    stock,
    price,
    category,
    subCategory,
    offer,
  } = req.body;

  const product = await productCollection.findOne({ productName });

  if (product) {
    return { success: false, error: "Product Already exists" };
  }

  const categoryID = await categoryCollection.findOne({
    categoryName: category,
  });
  const subCategoryID = await subCategoryCollection.findOne({
    subCategoryName: subCategory,
  });

  const newProduct = new productCollection({
    productName,
    productAbout,
    productDescription,
    price,
    stock,
    categoryID,
    subCategoryID,
    offer,
    productImage1: `/public/upload/${req.files["img1"][0].filename}`,
    productImage2: `/public/upload/${req.files["img2"][0].filename}`,
    productImage3: `/public/upload/${req.files["img3"][0].filename}`,
  });

  await newProduct.save();

  return { success: true };
};

// Service to get a product by id
export const getProduct = async (productID) => {
  const product = await productCollection
    .findById(productID)
    .populate("categoryID")
    .populate("subCategoryID");

  return product;
};

// Service to edit a product
export const editProduct = async (req, res, productID) => {
  const {
    productName,
    productDescription,
    productAbout,
    stock,
    price,
    category,
    subCategory,
    offer,
  } = req.body;

  const product = await productCollection.findOne({
    productName,
    _id: { $ne: productID },
  });

  if (product) {
    return { success: false, error: "Product with same name exists" };
  }

  // getting the id of category and subcategory
  const categoryID = await categoryCollection.findOne({
    categoryName: category,
  });
  const subCategoryID = await subCategoryCollection.findOne({
    subCategoryName: subCategory,
  });

  //finding the old product
  const oldProductData = await productCollection.findById(productID);

  let productImage1 = oldProductData.productImage1;
  let productImage2 = oldProductData.productImage2;
  let productImage3 = oldProductData.productImage3;

  //check the images are sent form frontend if there is no image the old image is taken
  if (req.files["img1"]) {
    fs.unlink(path.join("./", productImage1), (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    productImage1 = `/public/upload/${req.files["img1"][0].filename}`;
  }

  if (req.files["img2"]) {
    fs.unlink(path.join("./", productImage2), (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    productImage2 = `/public/upload/${req.files["img2"][0].filename}`;
  }

  if (req.files["img3"]) {
    fs.unlink(path.join("./", productImage3), (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
    productImage3 = `/public/upload/${req.files["img3"][0].filename}`;
  }

  await productCollection.updateOne(
    { _id: productID },
    {
      productName,
      productAbout,
      productDescription,
      price,
      stock,
      categoryID,
      subCategoryID,
      offer,
      productImage1,
      productImage2,
      productImage3,
    }
  );

  return { success: true };
};

//List or unlist a product
export const listUnlistProduct = async (productID, list) => {
  try {
    await productCollection.updateOne({ _id: productID }, { isListed: list });
  } catch (err) {
    console.log(err);
  }
};

//Service to get all listed categories
export const categories = async () => {
  try {
    const categories = await categoryCollection.find({ isListed: true });

    return categories;
  } catch (err) {
    console.log(err);
  }
};

// Service to get all listed subCategories
export const subCategories = async () => {
  try {
    const subCategories = await subCategoryCollection.find({ isListed: true });
    return subCategories;
  } catch (err) {
    console.log(err);
  }
};
