
//Services
const adminDashboardService = require('../services/adminDashboardService')
const adminUserService = require('../services/adminUserService');
const adminCategoryService = require('../services/adminCategoryService');
const adminSubCategoryService = require('../services/adminSubCategoryServices')
const adminProductService = require('../services/adminProductService');
const adminService = require('../services/adminService');
const adminOrderService = require('../services/adminOrderService');
const adminReturnService = require('../services/adminReturnService')
const adminOfferService = require('../services/adminOfferService')
const walletService = require('../services/walletService');
const transactionService = require('../services/transactionService')
const adminCouponService = require('../services/adminCouponServices');
const adminSalesService = require('../services/adminSalesService')

const mongoose = require('mongoose')
const dateFns = require('date-fns')
//Utils
const generateAccessToken = require('../utils/JWTUtils');
const { generateSalesPdf } = require('../utils/pdfUtils')
const { generateSalesExcel } = require('../utils/excelUtils')

//Render login page
exports.getLogin = (req, res) => {
    res.render('admin/login')
}

//handles user login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) { //when email and password not entered
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const adminData = await adminService.findUserByEmail(email);

        if (!adminData) { //when email doesnot exist in database
            return res.status(400).json({ error: 'Admin does not exist' });
        }

        const isValidPassword = await adminService.validateUserCredentials(password, adminData.password);

        if (!isValidPassword) { //If the password entered is not valid
            return res.status(400).json({ error: 'Incorrect password' });
        }

        //creating and storing JWT access token to in the cookie
        const accessToken = generateAccessToken(email);
        res.cookie('token', accessToken, { httpOnly: true, sameSite: 'Strict' });

        res.redirect('/admin');

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//handles logout
exports.postLogout = (req, res) => {
    res.clearCookie('token');
    res.status(200).redirect('/admin/login');
}

//render dashboard
exports.getDashboard = async (req, res) => {
    try {
        const graphType = req.query.graphType || 'yearly'
        const { topTenProductsList, topTenCategoryList, topTenSubCategoryList } = await adminDashboardService.TopTenList()

        let salesData = null;

        if (graphType === 'daily') {

            salesData = await adminDashboardService.dailySales()
            labels = salesData.map(item => `${item._id.day}`);

        } else if (graphType === 'monthly') {

            salesData = await adminDashboardService.monthlySales()
            labels = salesData.map(item => `${dateFns.format(new Date(item._id.year, item._id.month - 1, 1), 'MMMM')}`);

        } else if (graphType === 'yearly') {

            salesData = await adminDashboardService.yearlySales()
            labels = salesData.map(item => item._id.year);

        }

        totalSales = salesData.map(item => item.totalSales);

        res.render('admin/dashboard', { topTenProductsList, topTenCategoryList, topTenSubCategoryList, salesData: { labels, totalSales }, graphType })

    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

//renders users list page
exports.getUsers = async (req, res) => {
    try {
        const { search, page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { userList, totalNoOfList } = await adminUserService.userList(search, currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/users.ejs', { userList, searchFilter: search || null, currentPage, totalNoOfPages })

    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }

}

//Block or Unblock user 
exports.patchBlockUnblockUser = async (req, res) => {

    try {
        userID = req.params.id;
        await adminUserService.blockUnblockUser(userID)
        res.json({ success: true })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })

    }
}

//renderes product page
exports.getProducts = async (req, res) => {
    try {
        const { search, page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { productList, totalNoOfList } = await adminProductService.productList(search, currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/products', { productList, searchFilter: search || null, currentPage, totalNoOfPages })

    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }
}

//render page to add new product
exports.getAddProduct = async (req, res) => {
    const categories = await adminProductService.categories();
    const subCategories = await adminProductService.subCategories();

    res.render('admin/addProduct', { categories, subCategories, error: req.flash('ProductError') || '' })

}

//Adds new product
exports.postAddProduct = async (req, res) => {
    try {
        const error = await adminProductService.addProduct(req, res)
        if (error) {
            req.flash('ProductError', error)
            return res.redirect('/admin/products/addProduct')
        }
        res.redirect('/admin/products')

    } catch (err) {
        console.log(err);
        res.redirect('/error');
    }
}

//render product detailed page
exports.getViewEditProduct = async (req, res) => {
    try {
        const productID = req.params.id;


        const categories = await adminProductService.categories();
        const subCategories = await adminProductService.subCategories();
        const product = await adminProductService.viewProduct(productID);

        res.render('admin/viewEditProduct', { product, categories, subCategories })


    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }
}

//update product
exports.putViewEditProduct = async (req, res) => {
    try {
        const userID = req.params.id;
        await adminProductService.editProduct(req, res, userID)
        res.redirect('/admin/products')

    } catch (err) {
        console.log(err);
        res.redirect('/error');
    }
}

//delete product
exports.patchListUnlistProduct = async (req, res) => {
    try {
        const productID = req.params.id;
        const { list } = req.body;
        await adminProductService.listUnlistProduct(productID, list);
        res.json({ success: true })


    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }
}


//Categories and subCategory get
exports.getCategories = async (req, res) => {
    try {
        const { search, page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList
        const { categoryList, totalNoOfList } = await adminCategoryService.categoryList(search, currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
        res.render('admin/categories', { categoryList, searchFilter: search || null, currentPage, totalNoOfPages })


    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }

}


//categories
//add new category
exports.addCategory = async (req, res) => {
    try {
        const { categoryName, categoryDescription } = req.body;

        if (!categoryName || !categoryDescription) { //check categoryName and description are empty
            return res.status(400).json({ error: "category name or category name should not be empty" })
        }
        const error = await adminCategoryService.addCategory(categoryName, categoryDescription)

        if (error) {
            req.flash('CategoryError', error)
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//edit category
exports.putEditCategory = async (req, res) => {
    try {
        const categoryID = req.params.id;
        const { categoryName, categoryDescription } = req.body;

        if (!categoryName || !categoryDescription) {
            return res.status(400).json({ error: "category name or category description should not be empty" })
        }

        const error = await adminCategoryService.editCategory(categoryID, categoryName, categoryDescription);
        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//delete specific category
exports.patchListUnlistCategory = async (req, res) => {
    try {
        const categoryID = req.params.id;
        const { list } = req.body

        const error = await adminCategoryService.listUnlistCategory(categoryID, list);

        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//subCategory
//list sub categories
exports.getSubCategory = async (req, res) => {
    try {
        const { search, page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList
        const { subCategoryList, totalNoOfList } = await adminSubCategoryService.subCategoryList(search, currentPage, noOfList, skipPages);

        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList)
        res.render('admin/subCategories', { subCategoryList, searchFilter: search || null, currentPage, totalNoOfPages })


    } catch (err) {
        console.log(err);
        res.redirect('/error');

    }
}

//add new subCategory
exports.addSubCategory = async (req, res) => {
    try {
        const { subCategoryName, subCategoryDescription } = req.body;

        if (!subCategoryName || !subCategoryDescription) {
            return res.status(400).json({ error: "subCategory name or subCategory description should not be empty" })
        }

        const error = await adminSubCategoryService.addSubCategory(subCategoryName, subCategoryDescription)

        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })

    }
}

//edit subcategory
exports.putEditSubCategory = async (req, res) => {
    try {
        const subCategoryID = req.params.id;

        const { subCategoryName, subCategoryDescription } = req.body;

        if (!subCategoryName || !subCategoryDescription) {
            req.flash('SubCategoryError', "subCategory name or subCategory description should not be empty")
            return res.status(400).json({ error: "subCategory name or subCategory description should not be empty" })
        }
        const error = await adminSubCategoryService.editSubCategory(subCategoryID, subCategoryName, subCategoryDescription);
        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//delete specific subcategory
exports.patchListUnlistSubCategory = async (req, res) => {
    try {
        const subCategoryID = req.params.id;
        const { list } = req.body;
        const error = await adminSubCategoryService.listUnlistSubCategory(subCategoryID, list);
        if (error) {
            return res.status(400).json({ error })
        }
        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })

    }
}

//orders
//getorders
exports.getOrders = async (req, res) => {
    try {
        const { page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList
        const { orders, totalNoOfList } = await adminOrderService.viewOrders(currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/orders', { orders, currentPage, totalNoOfPages })
    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

//get specific order
exports.getViewEditOrder = async (req, res) => {
    try {
        const orderID = req.params.id;
        const { order, } = await adminOrderService.viewOrder(orderID);

        res.render('admin/viewEditOrder', { order });

    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

//change product status
exports.patchChageProductStatus = async (req, res) => {
    try {
        const productOrderID = req.params.id;
        const { orderID, status ,productID ,quantity } = req.body;
        await adminOrderService.changeProductStatus(productOrderID, orderID, status,productID,quantity)

        res.json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//returns
//display returns
exports.getReturns = async (req, res) => {
    try {

        const { page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { returnList, totalNoOfList } = await adminReturnService.returnsList(currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/returns', { returnList, currentPage, totalNoOfPages })
    } catch (err) {
        console.log(err);
        res.redirect('/error')

    }
}

exports.patchAproveRejectReturn = async (req, res) => {
    try {
        const { orderID, orderItemID, returnStatus, userID, amount, paymentMethod , productID , quantity} = req.body;
        await adminReturnService.aproveRejectReturn(orderID, orderItemID, returnStatus , productID ,quantity);

        if (returnStatus == 'approved' && (paymentMethod == "Wallet" || paymentMethod == "Razorpay")) {
            await walletService.addToWallet(userID, amount)
            await transactionService.completeTransaction(userID, amount, 'refund')
        }

        res.json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }

}

//transactions
exports.getTransactions = async (req, res) => {
    try {
        const { page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { transactionList, totalNoOfList } = await transactionService.allTransactionsList(currentPage, noOfList, skipPages);
        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/transactions', { transactionList, currentPage, totalNoOfPages })

    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}


exports.getOffers = async (req, res) => {
    try {
        const { search } = req.query;

        const { productList, categoryList, subCategoryList } = await adminOfferService.displayOffers(search)
        res.render('admin/offers', { productList, categoryList, subCategoryList, searchFilter: search || null })
    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

exports.postAddOffer = async (req, res) => {
    try {
        const { type, ID, offer } = req.body;

        await adminOfferService.addOffer(type, ID, offer)
        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

exports.deleteOffer = async (req, res) => {
    try {
        const ID = req.params.id;
        const { type } = req.body;

        await adminOfferService.deleteOffer(type, ID)
        res.status(200).json({ success: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}


//coupons
exports.getCoupons = async (req, res) => {
    try {
        const { search, page } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { couponList, totalNoOfList } = await adminCouponService.couponList(search, currentPage, noOfList, skipPages)

        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);
        res.render('admin/coupons', { couponList, currentPage, totalNoOfPages, searchFilter: search || null })

    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

exports.postAddCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate } = req.body;
        const error = await adminCouponService.addCoupon(couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate)

        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

exports.deleteCoupon = async (req, res) => {
    try {

        const couponID = req.params.id;
        await adminCouponService.deleteCoupon(couponID)
        return res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

exports.putEditCoupon = async (req, res) => {
    try {
        const couponID = req.params.id;
        const { couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate } = req.body;
        
        const error = await adminCouponService.editCoupon(couponID, couponName, couponCode, discountAmount, minimumOrderAmount, expiryDate)
        if (error) {
            return res.status(400).json({ error })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}


//sales
exports.getSales = async (req, res) => {
    try {
        const { page, reportType, startDate, endDate } = req.query;
        const currentPage = page || 1;
        const noOfList = 6;
        const skipPages = (currentPage - 1) * noOfList

        const { orderList, salesList, totalNoOfList } = await adminSalesService.salesList(reportType, startDate, endDate, currentPage, noOfList, skipPages)

        const totalNoOfPages = Math.ceil(totalNoOfList / noOfList);

        res.render('admin/sales', { salesList, orderList, reportType, startDate, endDate, currentPage, totalNoOfPages })

    } catch (err) {
        console.log(err);
        res.status('/error')
    }
}

exports.getDownloadSalesExcel = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.query;

        const salesList = await adminSalesService.downloadSalesReport(reportType, startDate, endDate)

        generateSalesExcel(req, res, salesList, reportType, startDate, endDate)

    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

exports.getDownloadSalesPdf = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.query;

        const salesList = await adminSalesService.downloadSalesReport(reportType, startDate, endDate);
        generateSalesPdf(req, res, salesList, reportType, startDate, endDate)

    } catch (err) {
        console.error(err);
        res.redirect('/error');
    }
};

