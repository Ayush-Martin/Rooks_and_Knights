//models
const subCategoryCollection = require("../models/subCategoryModel");
const productCollection = require("../models/productsModel");
const { list } = require("pdfkit");

//get category list
exports.subCategoryList = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = {};

  if (search) {
    findQuery.subCategoryName = {
      $regex: new RegExp(search, "i"),
    };
  }
  try {
    let totalNoOfList = await subCategoryCollection.countDocuments(findQuery);
    let subCategoryList = await subCategoryCollection
      .find(findQuery)
      .skip(skipPages)
      .limit(noOfList);

    return { subCategoryList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

//add sub category
exports.addSubCategory = async (subCategoryName, subCategoryDescription) => {
  try {
    let subCategory = await subCategoryCollection.findOne({
      subCategoryName: { $regex: new RegExp(`^${subCategoryName}$`, "i") },
    });

    if (subCategory) {
      //checks subcategory exist
      return "subCategory Aldready exists";

      // if (!subCategory.isListed) { //if subcategory not deleted
      //     return "subCategory Aldready exists"
      // }

      //if subcategory is not deleted change deletd to false
      // let oldsubCategory = await subCategoryCollection.findOneAndUpdate({ subCategoryName }, { $set: { isListed: false } })
      // return
    }

    //create a new sub cateogry
    const newsubCategory = new subCategoryCollection({
      subCategoryName,
      subCategoryDescription,
    });

    await newsubCategory.save();
  } catch (err) {
    console.log(err);
  }
};

//edit sub category
exports.editSubCategory = async (
  subCategoryID,
  subCategoryName,
  subCategoryDescription
) => {
  try {
    let subCategory = await subCategoryCollection.findOne({
      subCategoryName: { $regex: new RegExp(`^${subCategoryName}$`, "i") },
      _id: { $ne: subCategoryID },
    });

    if (subCategory) {
      //checks subcateogry exists
      return "subCategory already exists cannot edit";
    }

    await subCategoryCollection.updateOne(
      { _id: subCategoryID },
      { subCategoryName, subCategoryDescription }
    );
  } catch (err) {
    console.log(err);
  }
};

//deleted subcategory
exports.listUnlistSubCategory = async (subCategoryID, list) => {
  try {
    // const productExist = await productCollection.findOne({ subCategoryID: subCategoryID })

    // if (productExist) { //if product exists aldready the subcategory cannot be deleted
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
  } catch (err) {}
};
