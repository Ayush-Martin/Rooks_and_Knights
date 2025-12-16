import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cartSchema = Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    cartItems: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
        },
        categoryID: {
          type: Schema.Types.ObjectId,
          ref: "categories",
          required: true,
        },
        subCategoryID: {
          type: Schema.Types.ObjectId,
          ref: "subCategories",
          required: true,
        },
      },
    ],
    coupons: [
      {
        couponID: {
          type: Schema.Types.ObjectId,
          ref: "coupons",
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("carts", cartSchema);

export default Cart;
