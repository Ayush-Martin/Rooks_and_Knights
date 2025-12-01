//models
import categoryCollection from "../models/CategoryModel.js";
import productCollection from "../models/productsModel.js";

// Service to get Pagenated category list
export const categoryList = async (
  search,
  currentPage,
  noOfList,
  skipPages
) => {
  let findQuery = {}; // Filter query object

  if (search) {
    findQuery.categoryName = {
      $regex: new RegExp(search, "i"),
    };
  }

  let totalNoOfList = await categoryCollection.countDocuments(findQuery);
  let categoryList = await categoryCollection
    .find(findQuery)
    .skip(skipPages)
    .limit(noOfList);

  return { categoryList, currentPage, totalNoOfList };
};

//Service to add a category
export const addCategory = async (categoryName, categoryDescription) => {
  let category = await categoryCollection.findOne({
    categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
  });

  if (category) {
    return { success: false, error: "category Already exists" };
  }

  //category does not exist
  const newCategory = new categoryCollection({
    categoryName,
    categoryDescription,
  });

  await newCategory.save();

  return { success: true, message: "category added successfully" };
};

// Service to handle edit category
export const editCategory = async (
  categoryID,
  categoryName,
  categoryDescription
) => {
  let category = await categoryCollection.findOne({
    categoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
    _id: { $ne: categoryID },
  });

  if (category) {
    //if another category with same name exist already
    return { success: false, message: "category already exists cannot edit" };
  }

  await categoryCollection.updateOne(
    { _id: categoryID },
    { categoryName, categoryDescription }
  );

  return { success: true, message: "category edited successfully" };
};

// Service to list or unlist a category
export const listUnlistCategory = async (categoryId, list) => {
  // const productsExists = await productCollection.findOne({ categoryID: categoryId })
  // if (productsExists) {
  //     return "Categories with products cannot delete"
  // }
  await categoryCollection.updateOne({ _id: categoryId }, { isListed: list });
  await productCollection.updateMany(
    { categoryID: categoryId },
    { isListed: list }
  );
};
