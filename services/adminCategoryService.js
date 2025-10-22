//models
const categoryCollection = require("../models/CategoryModel");
const productCollection = require("../models/productsModel");

//get cateogy list
exports.categoryList = async (search, currentPage, noOfList, skipPages) => {
  let findQuery = {};

  if (search) {
    findQuery.categoryName = {
      $regex: new RegExp(search, "i"),
    };
  }
  try {
    let totalNoOfList = await categoryCollection.countDocuments(findQuery);
    let categoryList = await categoryCollection
      .find(findQuery)
      .skip(skipPages)
      .limit(noOfList);

    return { categoryList, currentPage, totalNoOfList };
  } catch (err) {
    console.log(err);
  }
};

//add a category
exports.addCategory = async (categoryName, categoryDescription) => {
  try {
    let category = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    });

    if (category) {
      //checks for the category exist aldready
      return "category Aldready exists";

      // if (!category.isListed) { //checks the category is not deleted
      //     return "category Aldready exists"
      // }

      //if category is deleted change deleted to flase
      // let oldCategory = await categoryCollection.findOneAndUpdate({ categoryName }, { $set: { isListed: false } })
      // return
    }

    //category does not exist
    const newCategory = new categoryCollection({
      categoryName,
      categoryDescription,
    });

    await newCategory.save();
  } catch (err) {
    console.log(err);
  }
};

//edit category
exports.editCategory = async (
  categoryID,
  categoryName,
  categoryDescription
) => {
  try {
    let category = await categoryCollection.findOne({
      categoryName,
      _id: { $ne: categoryID },
    });

    if (category) {
      //if anoter category with same name exist aldready
      return "category already exists cannot edit";
    }

    await categoryCollection.updateOne(
      { _id: categoryID },
      { categoryName, categoryDescription }
    );
  } catch (err) {
    console.log(err);
  }
};

//delete category
exports.listUnlistCategory = async (categoryId, list) => {
  try {
    // const productsExists = await productCollection.findOne({ categoryID: categoryId })
    // if (productsExists) {
    //     return "Categories with products cannot delete"
    // }
    await categoryCollection.updateOne({ _id: categoryId }, { isListed: list });
    await productCollection.updateMany(
      { categoryID: categoryId },
      { isListed: list }
    );
  } catch (err) {}
};
