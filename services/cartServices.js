//models
import cartCollection from "../models/cartModel.js";
import productCollection from "../models/productsModel.js";

// Service for adding a new product to cart
export const addToCart = async (
  userID,
  productID,
  quantity,
  categoryID,
  subCategoryID,
  price
) => {
  const product = await productCollection.findById(productID);
  const cart = await cartCollection.findOne({ userID });

  if (!cart) {
    //if cart doesn't exist create a new cart
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
    //checks product exist in cart already

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
      return { success: false, error: "Max quantity reached" };
    } else {
      //If the product quantity greater than product stock the product is not added
      return {
        success: false,
        error: "Item already in cart and out of stock",
      };
    }
  } else {
    // If the product doesn't exist, add it to the cart
    cart.cartItems.push({ productID, quantity, categoryID, subCategoryID });

    cart.totalPrice += product.price * Number(quantity);
  }

  await cart.save();
  return { success: true };
};

// Service for getting cart
export const getCart = async (userID) => {
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
    })
    .populate({
      path: "coupons.couponID",
    });

  if (!cart) {
    //If cart doesn't exist already create an empty cart
    const newCart = new cartCollection({
      userID,
      cartItems: [],
    });

    await newCart.save();
    return newCart;
  }
  console.log(JSON.stringify(cart));
  //if cart exist return cart
  return cart;
};

//delete product from cart
export const deleteCartItem = async (cartItemID, userID) => {
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
};

// Service for deleting multiple products from cart
export const deleteManyCartItem = async (cartItemIDs, price, userID) => {
  await cartCollection.updateOne(
    { userID },
    {
      $pull: { cartItems: { _id: { $in: cartItemIDs } } },
      $inc: { totalPrice: -price },
    }
  );
};

export const removeCartCoupons = async (userID) => {
  await cartCollection.updateOne({ userID }, { $set: { coupons: [] } });
};

// Helper to calculate offer price
const calculateOfferPrice = (product, category, subCategory) => {
  const offer = Math.max(
    product.offer || 0,
    category.offer || 0,
    subCategory.offer || 0
  );
  return product.price * (1 - offer / 100);
};

// Service for updating cart item quantity
export const updateCartItemQuantity = async (cartItemId, userID, action) => {
  const cart = await cartCollection
    .findOne({ userID })
    .populate("cartItems.productID")
    .populate("cartItems.categoryID")
    .populate("cartItems.subCategoryID");

  if (!cart) {
    return { success: false, error: "Cart not found" };
  }

  const cartItem = cart.cartItems.find(
    (item) => item._id.toString() === cartItemId
  );

  if (!cartItem) {
    return { success: false, error: "Cart item not found" };
  }

  if (action === "increase") {
    if (cartItem.quantity >= 10) {
      return { success: false, error: "Maximum quantity limit reached" };
    }
    if (cartItem.quantity >= cartItem.productID.stock) {
      return { success: false, error: "Product stock limit reached" };
    }
    cartItem.quantity += 1;
  } else if (action === "decrease") {
    if (cartItem.quantity <= 1) {
      return { success: false, error: "Minimum quantity reached" };
    }
    cartItem.quantity -= 1;
  }

  // Calculate item total with offers
  const discountedPrice = calculateOfferPrice(
    cartItem.productID,
    cartItem.categoryID,
    cartItem.subCategoryID
  );
  const itemTotal = discountedPrice * cartItem.quantity;

  // Recalculate cart total with offers
  const cartTotal = cart.cartItems.reduce((total, item) => {
    const itemDiscountedPrice = calculateOfferPrice(
      item.productID,
      item.categoryID,
      item.subCategoryID
    );
    return total + itemDiscountedPrice * item.quantity;
  }, 0);

  // Persist the recalculated cart total
  cart.totalPrice = Math.round(cartTotal);
  await cart.save();

  return {
    success: true,
    quantity: cartItem.quantity,
    total: Math.round(itemTotal),
    cartTotal: Math.round(cartTotal),
  };
};
