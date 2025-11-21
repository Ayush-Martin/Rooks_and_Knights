//importing modules
import express from "express";
const router = express.Router();

//controllers
import * as adminController from "../controllers/admin/adminController.js";
import * as adminCategoryController from "../controllers/admin/adminCategoryController.js";
import * as adminSubCategoryController from "../controllers/admin/adminSubCategoryController.js";
import * as adminUserController from "../controllers/admin/adminUserController.js";
import * as adminProductController from "../controllers/admin/adminProductController.js";
import * as adminOfferController from "../controllers/admin/adminOfferController.js";

//multer upload middleware
import upload, { handleUpload } from "../utils/multerUtils.js";

//middlewares
import * as adminMiddleware from "../middlewares/adminAuthMiddleware.js";

//routers
//Login
router
  .route("/login")
  .get(
    adminMiddleware.checkAdminAlreadyAuthenticated,
    adminController.loginPage
  )
  .post(adminController.login);

router.post("/logout", adminController.logout); //logout

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
router.get("/users", adminUserController.usersPage); //display user list
router.patch("/users/:id", adminUserController.blockUnblockUser); //block or unblock user

//Products
router.get("/products", adminProductController.productsPage);

router
  .route("/products/add")
  .get(adminProductController.addProductPage)
  .post(handleUpload, adminProductController.addProduct);

router
  .route("/products/:id")
  .get(adminProductController.productPage)
  .put(handleUpload, adminProductController.editProduct)
  .patch(adminProductController.listUnlistProduct);

//Categories
router
  .route("/categories")
  .get(adminCategoryController.categoriesPage)
  .post(adminCategoryController.addCategory);

router
  .route("/categories/:id")
  .put(adminCategoryController.editCategory)
  .patch(adminCategoryController.listUnlistCategory);

//subCategories
router
  .route("/subCategories")
  .get(adminSubCategoryController.subCategoriesPage)
  .post(adminSubCategoryController.addSubCategory);

router
  .route("/subCategories/:id")
  .put(adminSubCategoryController.editSubCategory)
  .patch(adminSubCategoryController.listUnlistSubCategory);

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

// Offers
router
  .route("/offers")
  .get(adminOfferController.offersPage)
  .post(adminOfferController.addOffer);

router
  .route("/offers/:id")
  .put(adminOfferController.editOffer)
  .delete(adminOfferController.deleteOffer);

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
