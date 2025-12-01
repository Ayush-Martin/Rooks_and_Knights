//models
import wishlistCollection from "../models/wishlistModel.js";

// Service for getting wishlist
export const getWishlist = async (userID) => {
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
};

// Service for adding new product to wishlist
export const addToWishlist = async (
  userID,
  productID,
  categoryID,
  subCategoryID
) => {
  console.log(userID);
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
};

// Service for deleting a product from wishlist
export const deleteFromWishlist = async (userID, productID) => {
  await wishlistCollection.updateOne(
    { userID },
    { $pull: { wishlistItems: { productID } } }
  );
};

export const productInWishlist = async (userID, productID) => {
  const productInWishlist = await wishlistCollection.findOne({
    userID,
    "wishlistItems.productID": productID,
  });
  return !!productInWishlist;
};
