//Services
import * as adminDashboardService from "../services/adminDashboardService.js";
import * as adminUserService from "../services/adminUserService.js";
import * as adminCategoryService from "../services/adminCategoryService.js";
import * as adminSubCategoryService from "../services/adminSubCategoryServices.js";
import * as adminProductService from "../services/adminProductService.js";
import * as adminService from "../services/adminService.js";
import * as adminOrderService from "../services/adminOrderService.js";
import * as adminReturnService from "../services/adminReturnService.js";
import * as adminOfferService from "../services/adminOfferService.js";
import * as walletService from "../services/walletService.js";
import * as transationService from "../services/transationService.js";
import * as adminCouponService from "../services/adminCouponServices.js";
import * as adminSalesService from "../services/adminSalesService.js";

import mongoose from "mongoose";
import { format } from "date-fns";
//Utils
import generateAccessToken from "../utils/JWTUtils.js";
import { generateSalesPdf } from "../utils/pdfUtils.js";
import { generateSalesExcel } from "../utils/excelUtils.js";

//Render login page
export const getLogin = (req, res) => {
  res.render("admin/login");
};

//handles user login
export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      //when email and password not entered
      return res.status(400).json({ error: "Email and password are required" });
    }

    const adminData = await adminService.findUserByEmail(email);

    if (!adminData) {
      //when email doesnot exist in database
      return res.status(400).json({ error: "Admin does not exist" });
    }

    const isValidPassword = await adminService.validateUserCredentials(
      password,
      adminData.password
    );

    if (!isValidPassword) {
      //If the password entered is not valid
      return res.status(400).json({ error: "Incorrect password" });
    }

    //creating and storing JWT access token to in the cookie
    const accessToken = generateAccessToken(email);
    res.cookie("token", accessToken, { httpOnly: true, sameSite: "Strict" });

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//handles logout
export const postLogout = (req, res) => {
  res.clearCookie("token");
  res.status(200).redirect("/admin/login");
};

//render dashboard
export const getDashboard = async (req, res) => {
  try {
    const graphType = req.query.graphType || "yearly";
    const { topTenProductsList, topTenCategoryList, topTenSubCategoryList } =
      await adminDashboardService.TopTenList();

    let salesData = null;

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

    totalSales = salesData.map((item) => item.totalSales);

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

//renders users list page
export const getUsers = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { userList, totalNoOfList } = await adminUserService.userList(
      search,
      currentPage,
      noOfList,
      skipPages
    );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/users.ejs", {
      userList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//Block or Unblock user
export const patchBlockUnblockUser = async (req, res) => {
  try {
    userID = req.params.id;
    await adminUserService.blockUnblockUser(userID);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//renderes product page
export const getProducts = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { productList, totalNoOfList } =
      await adminProductService.productList(
        search,
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/products", {
      productList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//render page to add new product
export const getAddProduct = async (req, res) => {
  const categories = await adminProductService.categories();
  const subCategories = await adminProductService.subCategories();

  res.render("admin/addProduct", {
    categories,
    subCategories,
    error: req.flash("ProductError") || "",
  });
};

//Adds new product
export const postAddProduct = async (req, res) => {
  try {
    const error = await adminProductService.addProduct(req, res);
    if (error) {
      req.flash("ProductError", error);
      return res.redirect("/admin/products/addProduct");
    }
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//render product detailed page
export const getViewEditProduct = async (req, res) => {
  try {
    const productID = req.params.id;

    const categories = await adminProductService.categories();
    const subCategories = await adminProductService.subCategories();
    const product = await adminProductService.viewProduct(productID);

    res.render("admin/viewEditProduct", { product, categories, subCategories });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//update product
export const putViewEditProduct = async (req, res) => {
  try {
    const userID = req.params.id;
    await adminProductService.editProduct(req, res, userID);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//delete product
export const patchListUnlistProduct = async (req, res) => {
  try {
    const productID = req.params.id;
    const { list } = req.body;
    await adminProductService.listUnlistProduct(productID, list);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//Categories and subCategory get
export const getCategories = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { categoryList, totalNoOfList } =
      await adminCategoryService.categoryList(
        search,
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
    res.render("admin/categories", {
      categoryList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//categories
//add new category
export const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
      //check categoryName and description are empty
      return res
        .status(400)
        .json({ error: "category name or category name should not be empty" });
    }
    const error = await adminCategoryService.addCategory(
      categoryName,
      categoryDescription
    );

    if (error) {
      req.flash("CategoryError", error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//edit category
export const putEditCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const { categoryName, categoryDescription } = req.body;

    if (!categoryName || !categoryDescription) {
      return res.status(400).json({
        error: "category name or category description should not be empty",
      });
    }

    const error = await adminCategoryService.editCategory(
      categoryID,
      categoryName,
      categoryDescription
    );
    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//delete specific category
export const patchListUnlistCategory = async (req, res) => {
  try {
    const categoryID = req.params.id;
    const { list } = req.body;

    const error = await adminCategoryService.listUnlistCategory(
      categoryID,
      list
    );

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//subCategory
//list sub categories
export const getSubCategory = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { subCategoryList, totalNoOfList } =
      await adminSubCategoryService.subCategoryList(
        search,
        currentPage,
        noOfList,
        skipPages
      );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
    res.render("admin/subCategories", {
      subCategoryList,
      searchFilter: search || null,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//add new subCategory
export const addSubCategory = async (req, res) => {
  try {
    const { subCategoryName, subCategoryDescription } = req.body;

    if (!subCategoryName || !subCategoryDescription) {
      return res.status(400).json({
        error:
          "subCategory name or subCategory description should not be empty",
      });
    }

    const error = await adminSubCategoryService.addSubCategory(
      subCategoryName,
      subCategoryDescription
    );

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//edit subcategory
export const putEditSubCategory = async (req, res) => {
  try {
    const subCategoryID = req.params.id;

    const { subCategoryName, subCategoryDescription } = req.body;

    if (!subCategoryName || !subCategoryDescription) {
      req.flash(
        "SubCategoryError",
        "subCategory name or subCategory description should not be empty"
      );
      return res.status(400).json({
        error:
          "subCategory name or subCategory description should not be empty",
      });
    }
    const error = await adminSubCategoryService.editSubCategory(
      subCategoryID,
      subCategoryName,
      subCategoryDescription
    );
    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//delete specific subcategory
export const patchListUnlistSubCategory = async (req, res) => {
  try {
    const subCategoryID = req.params.id;
    const { list } = req.body;
    const error = await adminSubCategoryService.listUnlistSubCategory(
      subCategoryID,
      list
    );
    if (error) {
      return res.status(400).json({ error });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//orders
//getorders
export const getOrders = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;
    const { orders, totalNoOfList } = await adminOrderService.viewOrders(
      currentPage,
      noOfList,
      skipPages
    );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/orders", { orders, currentPage, totalNoOfPages });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//get specific order
export const getViewEditOrder = async (req, res) => {
  try {
    const orderID = req.params.id;
    const { order } = await adminOrderService.viewOrder(orderID);

    res.render("admin/viewEditOrder", { order });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

//change product status
export const patchChageProductStatus = async (req, res) => {
  try {
    const productOrderID = req.params.id;
    const { orderID, status, productID, quantity } = req.body;
    await adminOrderService.changeProductStatus(
      productOrderID,
      orderID,
      status,
      productID,
      quantity
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//returns
//display returns
export const getReturns = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { returnList, totalNoOfList } = await adminReturnService.returnsList(
      currentPage,
      noOfList,
      skipPages
    );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/returns", { returnList, currentPage, totalNoOfPages });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

export const patchAproveRejectReturn = async (req, res) => {
  try {
    const {
      orderID,
      orderItemID,
      returnStatus,
      userID,
      amount,
      paymentMethod,
      productID,
      quantity,
    } = req.body;
    await adminReturnService.aproveRejectReturn(
      orderID,
      orderItemID,
      returnStatus,
      productID,
      quantity
    );

    if (
      returnStatus == "approved" &&
      (paymentMethod == "Wallet" || paymentMethod == "Razorpay")
    ) {
      await walletService.addToWallet(userID, amount);
      await transationService.completeTransation(userID, amount, "refund");
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//transations
export const getTransations = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { transationList, totalNoOfList } =
      await transationService.allTransationsList(
        currentPage,
        noOfList,
        skipPages
      );
    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

    res.render("admin/transations", {
      transationList,
      currentPage,
      totalNoOfPages,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

export const getOffers = async (req, res) => {
  try {
    const { search } = req.query;

    const { productList, categoryList, subCategoryList } =
      await adminOfferService.displayOffers(search);
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

export const postAddOffer = async (req, res) => {
  try {
    const { type, ID, offer } = req.body;

    await adminOfferService.addOffer(type, ID, offer);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

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

//coupons
export const getCoupons = async (req, res) => {
  try {
    const { search, page } = req.query;
    const currentPage = page || 1;
    const noOfList = 6;
    const skipPages = (currentPage - 1) * noOfList;

    const { couponList, totalNoOfList } = await adminCouponService.couponList(
      search,
      currentPage,
      noOfList,
      skipPages
    );

    const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
    res.render("admin/coupons", {
      couponList,
      currentPage,
      totalNoOfPages,
      searchFilter: search || null,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};

export const postAddCoupon = async (req, res) => {
  try {
    const {
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate,
    } = req.body;
    const error = await adminCouponService.addCoupon(
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate
    );

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    await adminCouponService.deleteCoupon(couponID);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const putEditCoupon = async (req, res) => {
  try {
    const couponID = req.params.id;
    const {
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate,
    } = req.body;

    const error = await adminCouponService.editCoupon(
      couponID,
      couponName,
      couponCode,
      discountAmount,
      minimumOrderAmount,
      expiryDate
    );
    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
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
