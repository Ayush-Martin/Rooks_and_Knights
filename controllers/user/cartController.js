//services
import * as cartServices from "../../services/cartServices.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller for cart page
export const cartPage = async (req, res) => {
  try {
    let cart = await cartServices.getCart(req.userID);

    res.render("cart", { cart });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to add product to cart
export const addToCart = async (req, res) => {
  try {
    const productID = req.params.id;
    const { quantity, categoryID, subCategoryID } = req.body;

    const userID = req.userID;

    const result = await cartServices.addToCart(
      userID,
      productID,
      quantity,
      categoryID,
      subCategoryID
    );
    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: result.error,
        errorRedirect: `<a href="/cart">Check cart</a>`,
      });
    }

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to delete cart item
export const deleteCartItem = async (req, res) => {
  try {
    const cartItemID = req.params.id;
    await cartServices.deleteCartItem(cartItemID, req.userID);

    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to update product quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { action } = req.body;
    const result = await cartServices.updateCartItemQuantity(
      cartItemId,
      req.userID,
      action
    );

    if (!result.success) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: result.error,
      });
    }

    res.status(StatusCode.OK).json({
      success: true,
      newQuantity: result.quantity,
      newTotal: result.total,
      cartTotal: result.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
