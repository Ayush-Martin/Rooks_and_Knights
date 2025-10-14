//services
const addressService = require("../services/addressServices");

//add new address
exports.postNewAddress = async (req, res) => {
  try {
    const { addressTitle, state, city, pinCode, streetAddress } = req.body;
    await addressService.addNewAddress(
      addressTitle,
      state,
      city,
      pinCode,
      streetAddress,
      req.userID
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//delete address
exports.deleteAddress = async (req, res) => {
  try {
    const addressID = req.params.id;

    await addressService.deleteAddress(addressID, req.userID);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//change or edit address
exports.putAddress = async (req, res) => {
  try {
    const { addressTitle, state, city, pinCode, streetAddress } = req.body;
    const addressID = req.params.id;
    await addressService.editAddress(
      addressTitle,
      state,
      city,
      pinCode,
      streetAddress,
      addressID,
      req.userID
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};
