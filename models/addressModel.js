import mongoose from "mongoose";

const Schema = mongoose.Schema;

const addressSchema = Schema(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    address: [
      {
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
    ],
  },
  { timestamps: true }
);

const address = mongoose.model("address", addressSchema);

export default address;
