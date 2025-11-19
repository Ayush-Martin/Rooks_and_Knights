//models
import productCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";

export const displayOffers = async (search) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};

export const addOffer = async (type, ID, offer) => {
  try {
    if (type == "product") {
      await productCollection.updateOne({ _id: ID }, { offer });
    } else if (type == "category") {
      await categoryCollection.updateOne({ _id: ID }, { offer });
    } else if (type == "subCategory") {
      await subCategoryCollection.updateOne({ _id: ID }, { offer });
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteOffer = async (type, ID) => {
  try {
    if (type == "product") {
      await productCollection.updateOne({ _id: ID }, { offer: 0 });
    } else if (type == "category") {
      await categoryCollection.updateOne({ _id: ID }, { offer: 0 });
    } else if (type == "subCategory") {
      await subCategoryCollection.updateOne({ _id: ID }, { offer: 0 });
    }
  } catch (err) {
    console.log(err);
  }
};
