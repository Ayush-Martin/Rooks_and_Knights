//models
import address from "../models/addressModel.js";
import addressCollection from "../models/addressModel.js";

//new address
export const addNewAddress = async (
  addressTitle,
  state,
  city,
  pinCode,
  streetAddress,
  userID
) => {
  try {
    const address = await addressCollection.findOne({ userID });

    if (!address) {
      //check an address collection exist aldready for the given user if not create one
      const newaddress = new addressCollection({
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

      return newaddress.save();
    }

    //if address collection exist for the given user add a new address to the address array
    address.address.push({ addressTitle, state, city, pinCode, streetAddress });

    await address.save();
  } catch (err) {
    console.log(err);
  }
};

//display all adress of the user
export const viewAddress = async (userID) => {
  try {
    const address = await addressCollection.findOne({ userID });

    if (!address) {
      //check an address collection exist aldready for the given user if not create one empty address
      const newaddress = new addressCollection({
        userID,
        address: [],
      });

      await newaddress.save();
      return newaddress;
    }

    //if address collection exist for the given user return the address data
    return address;
  } catch (err) {
    console.log(err);
  }
};

//delete an address
export const deleteAddress = async (addressID, userID) => {
  try {
    await addressCollection.updateOne(
      { userID },
      { $pull: { address: { _id: addressID } } }
    );
  } catch (err) {
    console.log(err);
  }
};

//edit an address
export const editAddress = async (
  addressTitle,
  state,
  city,
  pinCode,
  streetAddress,
  addressID,
  userID
) => {
  try {
    await addressCollection.updateOne(
      { userID: userID, "address._id": addressID },
      {
        $set: {
          "address.$.addressTitle": addressTitle,
          "address.$.state": state,
          "address.$.city": city,
          "address.$.pinCode": pinCode,
          "address.$.streetAddress": streetAddress,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};
