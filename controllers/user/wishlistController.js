//services
import * as wishlistService from "../../services/wishlistService.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller for wishlist page
export const wishlistPage = async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.userID);
    res.render("wishlist", { wishlist });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller for adding a product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const { categoryID, subCategoryID } = req.body;
    await wishlistService.addToWishlist(
      req.userID,
      productId,
      categoryID,
      subCategoryID
    );

    res
      .status(StatusCode.CREATED)
      .json({ success: true, successMessage: "product added to wishlist" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "server error" });
  }
};

// Controller for deleting a product from wishlist
export const deleteFromWishlist = async (req, res) => {
  try {
    const productID = req.params.id;

    await wishlistService.deleteFromWishlist(req.userID, productID);
    res
      .status(StatusCode.OK)
      .json({ success: true, successMessage: "product removed for wishlist" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "server error" });
  }
};
