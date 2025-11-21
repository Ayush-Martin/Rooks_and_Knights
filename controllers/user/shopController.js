//services
import * as shopServices from "../../services/shopServices.js";
import * as wishlistService from "../../services/wishlistService.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render products
export const productsPage = async (req, res) => {
  try {
    const { category, sortby, price, subCategory, search, page } = req.query;
    const currentPage = page || 1;
    const noOfProducts = 8;
    const skipPages = (currentPage - 1) * noOfProducts;
    const { productList, categoryList, subCategoryList, totalNoOfProducts } =
      await shopServices.productList(
        category,
        sortby,
        price,
        subCategory,
        search,
        currentPage,
        noOfProducts,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfProducts / noOfProducts);

    res.render("shop", {
      productList,
      categoryList,
      subCategoryList,
      categoryFilter: category || null,
      sortbyFilter: sortby || null,
      priceFilter: price || null,
      subCategoryFilter: subCategory || null,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to render product page
export const productPage = async (req, res) => {
  let _id = req.params.id;
  try {
    const { product, relatedProducts } = await shopServices.getProduct(_id);

    let productInWishlist = false;

    if (req.userID) {
      productInWishlist = await wishlistService.productInWishlist(
        req.userID,
        _id
      );
    }

    res.render("product", { product, relatedProducts, productInWishlist });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//add product review
export const addReview = async (req, res) => {
  let _id = req.params.id;
  try {
    const { ratingStar, comments } = req.body;
    const userID = req.userID;

    const newReview = {
      comments,
      ratingStar,
      userID,
    };

    await shopServices.addReview(_id, newReview);
    res.status(StatusCode.CREATED).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
