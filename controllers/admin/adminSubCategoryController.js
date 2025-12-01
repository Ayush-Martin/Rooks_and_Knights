import * as adminSubCategoryService from "../../services/adminSubCategoryServices.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render subCategories page
export const subCategoriesPage = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { subCategoryList, totalNoOfList } =
      await adminSubCategoryService.subCategoryList(
        search,
        currentPage,
        noOfList,
        skipPages
      );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
    res.render("admin/subCategories", {
      subCategoryList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to add subCategory
export const addSubCategory = async (req, res) => {
  try {
    const { subCategoryName, subCategoryDescription } = req.body;

    if (!subCategoryName || !subCategoryDescription) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error:
          "subCategory name or subCategory description should not be empty",
      });
    }

    const result = await adminSubCategoryService.addSubCategory(
      subCategoryName,
      subCategoryDescription
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

// Controller to edit subCategory
export const editSubCategory = async (req, res) => {
  try {
    const subCategoryID = req.params.id;

    const { subCategoryName, subCategoryDescription } = req.body;

    if (!subCategoryName || !subCategoryDescription) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error:
          "subCategory name or subCategory description should not be empty",
      });
    }
    const result = await adminSubCategoryService.editSubCategory(
      subCategoryID,
      subCategoryName,
      subCategoryDescription
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

// Controller to list or unlist a subCategory
export const listUnlistSubCategory = async (req, res) => {
  try {
    const subCategoryID = req.params.id;
    const { list } = req.body;
    const result = await adminSubCategoryService.listUnlistSubCategory(
      subCategoryID,
      list
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
