//Services
import * as adminDashboardService from "../../services/adminDashboardService.js";
import * as adminService from "../../services/adminService.js";
import * as adminOrderService from "../../services/adminOrderService.js";
import * as adminReturnService from "../../services/adminReturnService.js";
import * as walletService from "../../services/walletService.js";
import * as transationService from "../../services/transactionService.js";
import * as adminCouponService from "../../services/adminCouponServices.js";
import * as adminSalesService from "../../services/adminSalesService.js";

import { format } from "date-fns";
//Utils
import generateAccessToken from "../../utils/JWTUtils.js";
import { generateSalesPdf } from "../../utils/pdfUtils.js";
import { generateSalesExcel } from "../../utils/excelUtils.js";

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

//render dashboard
export const getDashboard = async (req, res) => {
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





//sales
export const getSales = async (req, res) => {
  try {
    const { page, reportType, startDate, endDate } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { orderList, salesList, totalNoOfList } =
      await adminSalesService.salesList(
        reportType,
        startDate,
        endDate,
        currentPage,
        noOfList,
        skipPages
      );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/sales", {
      salesList,
      orderList,
      reportType,
      startDate,
      endDate,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.status("/error");
  }
};

export const getDownloadSalesExcel = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const salesList = await adminSalesService.downloadSalesReport(
      reportType,
      startDate,
      endDate
    );

    generateSalesExcel(req, res, salesList, reportType, startDate, endDate);
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

export const getDownloadSalesPdf = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    const salesList = await adminSalesService.downloadSalesReport(
      reportType,
      startDate,
      endDate
    );
    generateSalesPdf(req, res, salesList, reportType, startDate, endDate);
  } catch (err) {
    console.error(err);
    res.redirect("/error");
  }
};
