import { StatusCode } from "../../constants/statusCodes.js";
import * as adminOfferService from "../../services/adminOfferService.js";

// Controller to render admin offer page
export const offersPage = async (req, res) => {
  try {
    const { search } = req.query;

    const { productList, categoryList, subCategoryList } =
      await adminOfferService.getOffers(search);

    res.render("admin/offers", {
      productList,
      categoryList,
      subCategoryList,
      searchFilter: search || null,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

// Controller to handle add offer
export const addOffer = async (req, res) => {
  try {
    const { type, ID, offer } = req.body;

    const updatedDocument = await adminOfferService.addOffer(type, ID, offer);
    res.status(StatusCode.OK).json({ success: true, updatedDocument });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controllr to handle delete offer
export const deleteOffer = async (req, res) => {
  try {
    const ID = req.params.id;
    const { type } = req.body;

    await adminOfferService.deleteOffer(type, ID);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// Controller to handle edit offer
export const editOffer = async (req, res) => {
  try {
    const ID = req.params.id;
    const { type, offer } = req.body;

    const updatedDocument = await adminOfferService.editOffer(type, ID, offer);
    res.status(StatusCode.OK).json({ success: true, updatedDocument });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};
