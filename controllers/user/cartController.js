//services
import * as cartServices from "../../services/cartServices.js";

//render cartpage
export const getCart = async (req, res) => {
  try {
    let cart = await cartServices.viewCart(req.userID);

    res.render("cart", { cart });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//adding a new product to cart
export const addToCart = async (req, res) => {
  try {
    const productID = req.params.id;
    const { quantity, categoryID, subCategoryID } = req.body;

    const userID = req.userID;

    const error = await cartServices.addToCart(
      userID,
      productID,
      quantity,
      categoryID,
      subCategoryID
    );
    if (error && error.error) {
      return res.status(200).json({
        error: error.error,
        errorRedirect: `<a href="/cart">Check cart</a>`,
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//delete cart
export const deleteCartItem = async (req, res) => {
  try {
    const cartItemID = req.params.id;
    await cartServices.deleteCartItem(cartItemID, req.userID);

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//increase product quantity
export const increaseQuantity = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const result = await cartServices.increaseQuantity(cartItemId, req.userID);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      success: true,
      newQuantity: result.quantity,
      newTotal: result.total,
      cartTotal: result.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//decrease product quantity
export const decreaseQuantity = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const result = await cartServices.decreaseQuantity(cartItemId, req.userID);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      success: true,
      newQuantity: result.quantity,
      newTotal: result.total,
      cartTotal: result.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};
