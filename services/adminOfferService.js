//models
import productCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";

// Service to get offers list with  search
export const getOffers = async (search) => {
  const productList = await productCollection.find({
    isListed: true,
    productName: { $regex: new RegExp(search, "i") },
  });
  const categoryList = await categoryCollection.find({
    isListed: true,
    categoryName: { $regex: new RegExp(search, "i") },
  });
  const subCategoryList = await subCategoryCollection.find({
    isListed: true,
    subCategoryName: { $regex: new RegExp(search, "i") },
  });

  return { productList, categoryList, subCategoryList };
};

// Service to add offer
export const addOffer = async (type, ID, offer) => {
  // Check for the type of offer and add the offer
  if (type == "product") {
    return await productCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  } else if (type == "category") {
    return await categoryCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  } else if (type == "subCategory") {
    return await subCategoryCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  }
};

// Service to delete offer
export const deleteOffer = async (type, ID) => {
  // Check for the type of offer and set the value of offer to 0

  if (type == "product") {
    await productCollection.updateOne({ _id: ID }, { offer: 0 });
  } else if (type == "category") {
    await categoryCollection.updateOne({ _id: ID }, { offer: 0 });
  } else if (type == "subCategory") {
    await subCategoryCollection.updateOne({ _id: ID }, { offer: 0 });
  }
};

// Service to edit offer
export const editOffer = async (type, ID, offer) => {
  if (type == "product") {
    return await productCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  } else if (type == "category") {
    return await categoryCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  } else if (type == "subCategory") {
    return await subCategoryCollection.findOneAndUpdate(
      { _id: ID },
      { $set: { offer } },
      { new: true }
    );
  }
};
