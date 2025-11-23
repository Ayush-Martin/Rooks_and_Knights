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
import * as adminCouponController from "../controllers/admin/adminCouponController.js";
import * as adminOrderController from "../controllers/admin/adminOrderController.js";
import * as adminReturnController from "../controllers/admin/adminReturnController.js";
import * as adminTransactionController from "../controllers/admin/adminTransactionController.js";
import * as adminSalesController from "../controllers/admin/adminSalesController.js";

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
router.get("/", adminController.dashboardPage);

//Users
router.get("/users", adminUserController.usersPage);
router.patch("/users/:id", adminUserController.blockUnblockUser);

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
router.get("/orders", adminOrderController.ordersPage);
router
  .route("/orders/:id")
  .get(adminOrderController.orderPage)
  .patch(adminOrderController.updateOrderProductStatus);

//returns
router
  .route("/returns")
  .get(adminReturnController.returnsPage)
  .patch(adminReturnController.approveRejectReturn);

//transactions
router.get("/transactions", adminTransactionController.transactionsPage);

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
router
  .route("/coupons")
  .get(adminCouponController.couponsPage)
  .post(adminCouponController.addCoupon);

router
  .route("/coupons/:id")
  .put(adminCouponController.editCoupon)
  .delete(adminCouponController.deleteCoupon);

//sales
router.get("/sales", adminSalesController.salesPage);
router.get("/sales/downloadExcel", adminSalesController.getDownloadSalesExcel);
router.get("/sales/downloadPdf", adminSalesController.getDownloadSalesPdf);

export default router;
