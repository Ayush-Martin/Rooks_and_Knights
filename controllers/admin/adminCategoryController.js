import * as adminCategoryService from "../../services/adminCategoryService.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render categories page
export const categoriesPage = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { categoryList, totalNoOfList } =
      await adminCategoryService.categoryList(
        search,
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/categories", {
      categoryList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.err(err);
    res.redirect("/error");
  }
};

// Controller to add category
export const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
      //check categoryName and description are empty
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "category name or category name should not be empty" });
    }

    const result = await adminCategoryService.addCategory(
      categoryName,
      categoryDescription
    );

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.error });
    }

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to list or unlist a category
export const listUnlistCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const { list } = req.body;

    await adminCategoryService.listUnlistCategory(categoryID, list);

    res.status(StatusCode.OK).json({ categoryID, list });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to handle edit category
export const editCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: "category name or category description should not be empty",
      });
    }

    const result = await adminCategoryService.editCategory(
      categoryID,
      categoryName,
      categoryDescription
    );
    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: result.message });
    }

    res
      .status(StatusCode.OK)
      .json({ success: true, categoryID, categoryName, categoryDescription });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
