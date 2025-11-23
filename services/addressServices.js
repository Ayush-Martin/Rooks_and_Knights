//models
import addressCollection from "../models/addressModel.js";

// Service to add new address
export const addNewAddress = async (
  addressTitle,
  state,
  city,
  pinCode,
  streetAddress,
  userID
) => {
  const address = await addressCollection.findOne({ userID });

  if (!address) {
    //check an address collection exist already for the given user if not create one
    const newAddress = new addressCollection({
      userID,
      address: [
        {
          addressTitle,
          state,
          city,
          pinCode,
          streetAddress,
        },
      ],
    });

    const savedDoc = await newAddress.save();
    return savedDoc.address[0];
  }

  //if address collection exist for the given user add a new address to the address array
  address.address.push({ addressTitle, state, city, pinCode, streetAddress });

  const savedDoc = await address.save();
  return savedDoc.address[savedDoc.address.length - 1];
};

// Service to get the address data based on user ID
export const viewAddress = async (userID) => {
  const address = await addressCollection.findOne({ userID });

  if (!address) {
    //check an address collection exist already for the given user if not create one empty address
    const newAddress = new addressCollection({
      userID,
      address: [],
    });

    await newAddress.save();
    return newAddress;
  }

  //if address collection exist for the given user return the address data
  return address;
};

// Service to delete address
export const deleteAddress = async (addressID, userID) => {
  await addressCollection.updateOne(
    { userID },
    { $pull: { address: { _id: addressID } } }
  );
};

// Service to edit address
export const editAddress = async (
  addressTitle,
  state,
  city,
  pinCode,
  streetAddress,
  addressID,
  userID
) => {
  const updatedDoc = await addressCollection.findOneAndUpdate(
    { userID: userID, "address._id": addressID },
    {
      $set: {
        "address.$.addressTitle": addressTitle,
        "address.$.state": state,
        "address.$.city": city,
        "address.$.pinCode": pinCode,
        "address.$.streetAddress": streetAddress,
      },
    },
    { new: true }
  );

  if (updatedDoc) {
    return updatedDoc.address.find((addr) => addr._id.toString() === addressID);
  }
  return null;
};
