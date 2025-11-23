//Services
import * as adminDashboardService from "../../services/adminDashboardService.js";
import * as adminService from "../../services/adminService.js";

import { format } from "date-fns";
//Utils
import generateAccessToken from "../../utils/JWTUtils.js";

import { StatusCode } from "../../constants/statusCodes.js";

// Controller to render admin login page`
export const loginPage = (req, res) => {
  res.render("admin/login");
};

// Controller to handle admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      //when email and password not entered
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const adminData = await adminService.findAdminByEmail(email);

    if (!adminData) {
      //when email doesnot exist in database
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Admin does not exist" });
    }

    const isValidPassword = await adminService.validateAdminCredentials(
      password,
      adminData.password
    );

    if (!isValidPassword) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: "Incorrect password" });
    }

    //creating and storing JWT access token to in the cookie
    const accessToken = generateAccessToken(email);
    res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });
    res
      .status(StatusCode.OK)
      .json({ success: true, successRedirect: "/admin" });
  } catch (err) {
    console.error(err);
    res
      .status(StatusCode.INTERNAL_SERVER_ERROR)
      .json({ error: "Server Error" });
  }
};

// Controller to handle admin logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
};

// Controller to get dashboard page
export const dashboardPage = async (req, res) => {
  try {
    const graphType = req.query.graphType || "yearly";
    const { topTenProductsList, topTenCategoryList, topTenSubCategoryList } =
      await adminDashboardService.TopTenList();

    let salesData = null;
    let labels = null;

    if (graphType === "daily") {
      salesData = await adminDashboardService.dailySales();
      labels = salesData.map((item) => `${item._id.day}`);
    } else if (graphType === "monthly") {
      salesData = await adminDashboardService.monthlySales();
      labels = salesData.map(
        (item) =>
          `${format(new Date(item._id.year, item._id.month - 1, 1), "MMMM")}`
      );
    } else if (graphType === "yearly") {
      salesData = await adminDashboardService.yearlySales();
      labels = salesData.map((item) => item._id.year);
    }

    const totalSales = salesData.map((item) => item.totalSales);

    res.render("admin/dashboard", {
      topTenProductsList,
      topTenCategoryList,
      topTenSubCategoryList,
      salesData: { labels, totalSales },
      graphType,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};
