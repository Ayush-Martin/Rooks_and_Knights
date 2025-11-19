//models
import wishlistCollection from "../models/wishlistModel.js";

//render wislist
export const viewWishlist = async (userID) => {
  try {
    const wishlist = await wishlistCollection
      .findOne({ userID })
      .populate("wishlistItems.productID")
      .populate("wishlistItems.categoryID")
      .populate("wishlistItems.subCategoryID");

    if (!wishlist) {
      const newWishlist = new wishlistCollection({
        userID,
        wishlistItems: [],
      });

      await newWishlist.save();
      return newWishlist;
    }
    return wishlist;
  } catch (err) {
    console.log(err);
  }
};

//add new product to wishlit
export const addToWishlist = async (
  userID,
  productID,
  categoryID,
  subCategoryID
) => {
  try {
    const wishlist = await wishlistCollection.findOne({ userID });

    if (!wishlist) {
      const newWishlist = new wishlistCollection({
        userID,
        wishlistItems: [
          {
            productID,
            categoryID,
            subCategoryID,
          },
        ],
      });

      await newWishlist.save();
      return;
    }

    wishlist.wishlistItems.push({ productID, categoryID, subCategoryID });

    await wishlist.save();
  } catch (err) {
    console.log(err);
  }
};

//delete a product form wishlist
export const deleteFromWishlist = async (userID, productID) => {
  try {
    const updatedWishlist = await wishlistCollection.updateOne(
      { userID },
      { $pull: { wishlistItems: { productID } } }
    );
  } catch (err) {
    console.log(err);
  }
};

export const productInWishlist = async (userID, productID) => {
  try {
    const productInWishlist = await wishlistCollection.findOne({
      userID,
      "wishlistItems.productID": productID,
    });
    return !!productInWishlist;
  } catch (err) {
    console.log(err);
  }
};
