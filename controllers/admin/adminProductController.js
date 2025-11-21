import { StatusCode } from "../../constants/statusCodes.js";
import * as adminProductService from "../../services/adminProductService.js";

// Controller to render admin products page
export const productsPage = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { productList, totalNoOfList } =
      await adminProductService.getProducts(
        search,
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/products", {
      productList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to render admin add product page
export const addProductPage = async (req, res) => {
  const categories = await adminProductService.categories();
  const subCategories = await adminProductService.subCategories();

  res.render("admin/addProduct", {
    categories,
    subCategories,
    error: req.flash("ProductError") || "", // Display error message
  });
};

// Controller to add new product
export const addProduct = async (req, res) => {
  try {
    const result = await adminProductService.addProduct(req, res);
    if (!result.success) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ success: false, error: result.error });
    }

    res
      .status(StatusCode.OK)
      .json({ success: true, successRedirect: "/admin/products" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to render admin product page
export const productPage = async (req, res) => {
  try {
    const productID = req.params.id;

    const categories = await adminProductService.categories();
    const subCategories = await adminProductService.subCategories();
    const product = await adminProductService.getProduct(productID);

    res.render("admin/viewEditProduct", {
      product,
      categories,
      subCategories,
      error: req.flash("ProductError") || "",
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to edit product
export const editProduct = async (req, res) => {
  try {
    const userID = req.params.id;
    const result = await adminProductService.editProduct(req, res, userID);

    if (!result.success) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ success: false, error: result.error });
    }

    res
      .status(StatusCode.OK)
      .json({ success: true, successRedirect: "/admin/products" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to list or unlist a product
export const listUnlistProduct = async (req, res) => {
  try {
    const productID = req.params.id;
    const list = req.query.list === "true";
    await adminProductService.listUnlistProduct(productID, list);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
