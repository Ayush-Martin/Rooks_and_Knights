//models
const cartCollection = require("../models/cartModel");
const productCollection = require("../models/productsModel");

//Add a new product to cart
exports.addToCart = async (
  userID,
  productID,
  quantity,
  categoryID,
  subCategoryID
) => {
  try {
    const product = await productCollection.findById(productID);
    const cart = await cartCollection.findOne({ userID });

    if (!cart) {
      //if cart doesnot exist create a new cart
      const newCart = new cartCollection({
        userID,
        cartItems: [
          {
            productID,
            quantity,
            categoryID,
            subCategoryID,
          },
        ],
        totalPrice: product.price * quantity,
      });

      return await newCart.save();
    }

    const cartItemIndex = cart.cartItems.findIndex(
      (item) => item.productID.toString() === productID
    );
    const maxQuantity = 10;

    if (cartItemIndex !== -1) {
      //checks product exist in cart aldready

      if (
        cart.cartItems[cartItemIndex].quantity + Number(quantity) <=
          product.stock &&
        cart.cartItems[cartItemIndex].quantity + Number(quantity) <= maxQuantity
      ) {
        // If the product exists, update its quantity
        cart.cartItems[cartItemIndex].quantity += Number(quantity);
        cart.totalPrice += product.price * Number(quantity);
      } else if (
        cart.cartItems[cartItemIndex].quantity + Number(quantity) >
        maxQuantity
      ) {
        //If the product reached max quantity then not added
        return { error: "Max quantity reached" };
      } else {
        //If the product quantity greater than product stock the product is not added
        return { error: "Item aldready in cart and out of stock" };
      }
    } else {
      // If the product doesn't exist, add it to the cart
      cart.cartItems.push({ productID, quantity, categoryID, subCategoryID });

      cart.totalPrice += product.price * Number(quantity);
    }

    return await cart.save();
  } catch (err) {
    console.log(err);
  }
};

//view cart
exports.viewCart = async (userID) => {
  try {
    const cart = await cartCollection
      .findOne({ userID })
      .populate({
        path: "cartItems.productID",
      })
      .populate({
        path: "cartItems.categoryID",
      })
      .populate({
        path: "cartItems.subCategoryID",
      });

    if (!cart) {
      //If cart doesnot exist aldready create an empty cart
      const newCart = new cartCollection({
        userID,
        cartItems: [],
      });

      await newCart.save();
      return newCart;
    }

    //if cart exist return cart
    return cart;
  } catch (err) {
    console.log(err);
  }
};

//delete product from cart
exports.deleteCartItem = async (cartItemID, userID) => {
  try {
    let cart = await cartCollection.findOne({ userID }).populate({
      path: "cartItems.productID",
    });

    let price = 0;
    cart.cartItems.forEach((cartItem) => {
      if (cartItem._id == cartItemID) {
        price = cartItem.productID.price * cartItem.quantity;
      }
    });

    await cartCollection.updateOne(
      { userID },
      {
        $pull: { cartItems: { _id: cartItemID } },
        $inc: { totalPrice: -price },
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.deleteManyCartItem = async (cartItemIDs, price, userID) => {
  try {
    await cartCollection.updateOne(
      { userID },
      {
        $pull: { cartItems: { _id: { $in: cartItemIDs } } },
        $inc: { totalPrice: -price },
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.increaseQuantity = async (cartItemId, userID) => {
  try {
    const cart = await cartCollection
      .findOne({ userID })
      .populate("cartItems.productID")
      .populate("cartItems.categoryID")
      .populate("cartItems.subCategoryID");
    const cartItem = cart.cartItems.find(
      (item) => item._id.toString() === cartItemId
    );

    if (!cartItem) {
      return { error: "Cart item not found" };
    }

    if (cartItem.quantity >= 10) {
      return { error: "Maximum quantity limit reached" };
    }

    if (cartItem.quantity >= cartItem.productID.stock) {
      return { error: "Product stock limit reached" };
    }

    cartItem.quantity += 1;

    // Calculate item total with offer
    const offerPercentage = Math.max(
      cartItem.productID.offer || 0,
      cartItem.categoryID.offer || 0,
      cartItem.subCategoryID.offer || 0
    );

    const itemTotal =
      cartItem.productID.price *
      cartItem.quantity *
      (1 - offerPercentage / 100);

    // Recalculate cart total
    const cartTotal = cart.cartItems.reduce((total, item) => {
      const itemOffer = Math.max(
        item.productID.offer || 0,
        item.categoryID.offer || 0,
        item.subCategoryID.offer || 0
      );
      return (
        total + item.productID.price * item.quantity * (1 - itemOffer / 100)
      );
    }, 0);

    // Persist the recalculated cart total to the DB so other flows read the correct value
    cart.totalPrice = Math.round(cartTotal);
    await cart.save();

    return {
      quantity: cartItem.quantity,
      total: Math.round(itemTotal),
      cartTotal: Math.round(cartTotal),
    };
  } catch (err) {
    console.log(err);
    return { error: "Server error" };
  }
};

exports.decreaseQuantity = async (cartItemId, userID) => {
  try {
    const cart = await cartCollection
      .findOne({ userID })
      .populate("cartItems.productID")
      .populate("cartItems.categoryID")
      .populate("cartItems.subCategoryID");
    const cartItem = cart.cartItems.find(
      (item) => item._id.toString() === cartItemId
    );

    if (!cartItem) {
      return { error: "Cart item not found" };
    }

    if (cartItem.quantity <= 1) {
      return { error: "Minimum quantity reached" };
    }

    cartItem.quantity -= 1;

    // Calculate item total with offer
    const offerPercentage = Math.max(
      cartItem.productID.offer || 0,
      cartItem.categoryID.offer || 0,
      cartItem.subCategoryID.offer || 0
    );

    const itemTotal =
      cartItem.productID.price *
      cartItem.quantity *
      (1 - offerPercentage / 100);

    // Recalculate cart total
    const cartTotal = cart.cartItems.reduce((total, item) => {
      const itemOffer = Math.max(
        item.productID.offer || 0,
        item.categoryID.offer || 0,
        item.subCategoryID.offer || 0
      );
      return (
        total + item.productID.price * item.quantity * (1 - itemOffer / 100)
      );
    }, 0);

    // Persist the recalculated cart total to the DB so other flows read the correct value
    cart.totalPrice = Math.round(cartTotal);
    await cart.save();

    return {
      quantity: cartItem.quantity,
      total: Math.round(itemTotal),
      cartTotal: Math.round(cartTotal),
    };
  } catch (err) {
    console.log(err);
    return { error: "Server error" };
  }
};
