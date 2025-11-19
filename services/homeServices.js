import productCollection from "../models/productsModel.js";
import categoryCollection from "../models/CategoryModel.js";
import subCategoryCollection from "../models/subCategoryModel.js";

export const index = async () => {
  try {
    let categories = await categoryCollection.find({ isListed: true });
    let topProductList = await productCollection
      .find({ isListed: true })
      .populate("categoryID")
      .populate("subCategoryID")
      .sort({ noOfOrders: -1 })
      .limit(8);

    return { categories, topProductList };
  } catch (err) {
    console.log(err);
  }
};
