//services
import * as addressService from "../../services/addressServices.js";
import { StatusCode } from "../../constants/statusCodes.js";

// Controller to add new address
export const addAddress = async (req, res) => {
  try {
    const { addressTitle, state, city, pinCode, streetAddress } = req.body;
    const newAddress = await addressService.addNewAddress(
      addressTitle,
      state,
      city,
      pinCode,
      streetAddress,
      req.userID
    );
    res.status(StatusCode.OK).json({ success: true, newAddress });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to delete address
export const deleteAddress = async (req, res) => {
  try {
    const addressID = req.params.id;

    await addressService.deleteAddress(addressID, req.userID);
    res.status(StatusCode.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to update address
export const updateAddress = async (req, res) => {
  try {
    const { addressTitle, state, city, pinCode, streetAddress } = req.body;
    const addressID = req.params.id;
    const updatedAddress = await addressService.editAddress(
      addressTitle,
      state,
      city,
      pinCode,
      streetAddress,
      addressID,
      req.userID
    );
    res.status(StatusCode.OK).json({ success: true, updatedAddress });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
