//services
import * as homeServices from "../../services/homeServices.js";

export const getHome = async (req, res) => {
  try {
    let { categories, topProductList } = await homeServices.index();
    res.render("index", { categories, topProductList });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};
