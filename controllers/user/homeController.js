//services
import * as homeServices from "../../services/homeServices.js";

// Controller to render home page
export const homePage = async (req, res) => {
  try {
    let { categories, topProductList } = await homeServices.index();
    res.render("index", { categories, topProductList });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};
