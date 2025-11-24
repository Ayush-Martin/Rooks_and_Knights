//models
import subCategoryCollection from "../models/subCategoryModel.js";
import productCollection from "../models/productsModel.js";

//get category list
export const subCategoryList = async (
  search,
  currentPage,
  noOfList,
  skipPages
) => {
  let findQuery = {};

  if (search) {
    findQuery.subCategoryName = {
      $regex: new RegExp(search, "i"),
    };
  }

  let totalNoOfList = await subCategoryCollection.countDocuments(findQuery);
  let subCategoryList = await subCategoryCollection
    .find(findQuery)
    .skip(skipPages)
    .limit(noOfList);

  return { subCategoryList, currentPage, totalNoOfList };
};

//add sub category
export const addSubCategory = async (
  subCategoryName,
  subCategoryDescription
) => {
  let subCategory = await subCategoryCollection.findOne({
    subCategoryName: { $regex: new RegExp(`^${subCategoryName}$`, "i") },
  });

  if (subCategory) {
    //checks subcategory exist
    return { success: false, error: "subCategory Already exists" };
  }

  //create a new sub category
  const newSubCategory = new subCategoryCollection({
    subCategoryName,
    subCategoryDescription,
  });

  await newSubCategory.save();
  return { success: true, message: "subCategory added successfully" };
};

//edit sub category
export const editSubCategory = async (
  subCategoryID,
  subCategoryName,
  subCategoryDescription
) => {
  let subCategory = await subCategoryCollection.findOne({
    subCategoryName: { $regex: new RegExp(`^${subCategoryName}$`, "i") },
    _id: { $ne: subCategoryID },
  });

  if (subCategory) {
    //checks subcategory exists
    return { success: false, error: "subCategory already exists cannot edit" };
  }

  await subCategoryCollection.updateOne(
    { _id: subCategoryID },
    { subCategoryName, subCategoryDescription }
  );
  return { success: true, message: "subCategory edited successfully" };
};

//deleted subcategory
export const listUnlistSubCategory = async (subCategoryID, list) => {
  // const productExist = await productCollection.findOne({ subCategoryID: subCategoryID })

  // if (productExist) { //if product exists already the subcategory cannot be deleted
  //     return "SubCategories with products cannot be deleted"
  // }
  await subCategoryCollection.updateOne(
    { _id: subCategoryID },
    { isListed: list }
  );
  await productCollection.updateMany(
    { _id: subCategoryID },
    { isListed: list }
  );
  return { success: true, message: "subCategory status changed successfully" };
};
