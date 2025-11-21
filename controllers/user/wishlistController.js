//services
import * as wishlistService from "../../services/wishlistService.js";

//render wishlist page
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.viewWishlist(req.userID);
    res.render("wishlist", { wishlist });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//add a product to wishlist
export const addToWihslist = async (req, res) => {
  try {
    const productId = req.params.id;
    const { categoryID, subCategoryID } = req.body;
    let error = await wishlistService.addToWishlist(
      req.userID,
      productId,
      categoryID,
      subCategoryID
    );

    res.json({ success: true, successMessage: "product added to wishlist" });
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
};

//delete a product form wishlist
export const deleteFromWishlist = async (req, res) => {
  try {
    const productID = req.params.id;

    await wishlistService.deleteFromWishlist(req.userID, productID);
    res.json({ success: true, successMessage: "product removed for wihslist" });
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
};
