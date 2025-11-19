import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    address: {
      addressTitle: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      pinCode: {
        type: String,
        required: true,
      },
      streetAddress: {
        type: String,
        reqired: true,
      },
    },
    basePrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "pending",
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: "pending",
    },
    taxAmmount: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 100,
    },
    products: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "products",
        },
        quantity: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "delivered", "canceled"],
          default: "pending",
        },
        returnReason: {
          type: String,
        },
        returnStatus: {
          type: String,
          enum: ["requested", "approved", "rejected", "notRequested"],
          default: "notRequested",
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          required: true,
          default: 0,
        },
        amountPaid: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const orders = mongoose.model("orders", orderSchema);

export default orders;
