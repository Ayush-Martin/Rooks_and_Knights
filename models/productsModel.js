import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProductsSchema = new Schema(
  {
    productName: {
      type: String,
      unique: true,
      required: true,
    },

    productDescription: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    productAbout: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
    },

    reviews: [
      {
        comments: { type: String },
        ratingStar: { type: Number, min: 1, max: 5 },
        userID: { type: Schema.Types.ObjectId, ref: "users" },
      },
    ],

    noOfOrders: {
      type: Number,
      required: true,
      default: 0,
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

    productImage1: {
      type: String,
      required: true,
    },

    productImage2: {
      type: String,
      required: true,
    },

    productImage3: {
      type: String,
      required: true,
    },

    offer: {
      type: Number,
      default: 0,
    },

    isListed: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const Products = mongoose.model("products", ProductsSchema);

export default Products;
