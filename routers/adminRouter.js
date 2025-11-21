//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as adminController from "../controllers/adminController.js";

//multer upload middleware
import upload, { handleUpload } from "../utils/multerUtils.js";

//middlewares
import * as adminMiddleware from "../middlewares/adminAuthMiddleware.js";

//routers
//Login
router.get(
  "/login",
  adminMiddleware.checkAdminAldreadyAuthenticated,
  adminController.getLogin
); //display login page
router.post("/login", adminController.postLogin); //login
router.post("/logout", adminController.postLogout); //logout

//set up middleware for get request
router.use((req, res, next) => {
  if (req.method == "GET" && req.url != "/login") {
    return adminMiddleware.checkAdminAuthenticated(req, res, next);
  }
  next();
});

//set up middleware for routes other that get
router.use((req, res, next) => {
  if (req.method != "GET") {
    return adminMiddleware.validAdmin(req, res, next);
  }
  next();
});

//Dashboard
router.get("/", adminController.getDashboard); //display dashboard

//Users
router.get("/users", adminController.getUsers); //display user list
router.patch("/users/:id", adminController.patchBlockUnblockUser); //block or unblock user

//Products
router.get("/products", adminController.getProducts); //display products
router.get("/products/addProduct", adminController.getAddProduct); //display page to add a new product
router.post("/products/addProduct", handleUpload, adminController.postAddProduct); //add a new product
router.get("/products/viewEditProduct/:id", adminController.getViewEditProduct); //view specif product
router.post(
  "/products/viewEditProduct/:id",
  handleUpload,
  adminController.putViewEditProduct
); //edit a product
router.patch("/products/:id", adminController.patchListUnlistProduct); //delete a product

//Categories
router.get("/categories", adminController.getCategories); //display categories
router.post("/categories", adminController.addCategory); //add new category
router.put("/categories/:id", adminController.putEditCategory); //edit a category
router.patch("/categories/:id", adminController.patchListUnlistCategory); //delete a category

//subCategories
router.get("/subCategories", adminController.getSubCategory); //display sub categories
router.post("/subCategories", adminController.addSubCategory); //add new sub category
router.put("/subCategories/:id", adminController.putEditSubCategory); //edit a sub category
router.patch("/subCategories/:id", adminController.patchListUnlistSubCategory); //delet a sub category

//orders
router.get("/orders", adminController.getOrders); //display orders
router.get("/orders/viewEditOrder/:id", adminController.getViewEditOrder); //display specific order
router.patch(
  "/orders/viewEditOrder/:id",
  adminController.patchChageProductStatus
); //update product status

//returns
router.get("/returns", adminController.getReturns); //display returns
router.patch("/returns", adminController.patchAproveRejectReturn); //approve or reject returns

//transations
router.get("/transations", adminController.getTransations); //display transations

//offers
router.get("/offers", adminController.getOffers); //display offers
router.post("/offers", adminController.postAddOffer); //add new offer
router.delete("/offers/:id", adminController.deleteOffer); //delete offer

//coupons
router.get("/coupons", adminController.getCoupons); //display coupons
router.post("/coupons", adminController.postAddCoupon); //add coupon
router.delete("/coupons/:id", adminController.deleteCoupon); //delete coupon
router.put("/coupons/:id", adminController.putEditCoupon); //edit coupon

//sales
router.get("/sales", adminController.getSales); //dispaly sales
router.get("/sales/downloadExcel", adminController.getDownloadSalesExcel); //download sales excel
router.get("/sales/downloadPdf", adminController.getDownloadSalesPdf); //download sales pdf

export default router;
