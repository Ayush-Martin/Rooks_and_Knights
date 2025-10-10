//Requiring modules
const express = require('express');
const router = express.Router();
const passport = require('passport')

//Controllers
const userController = require('../controllers/userController');

//middlewares
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');
const OTPMiddleware = require("../middlewares/OTPMiddleware");


//Routers
//Login
router.get('/login', userAuthMiddleware.checkUserAlreadyAuthenticated, userController.getLogin);
router.post('/login', userController.postLogin);
router.post('/logout', userController.postLogout);


//Register
router.get('/register', userAuthMiddleware.checkUserAlreadyAuthenticated, userController.getRegister);
router.post('/register', userController.postRegister);


//Complete Register
router.get('/completeRegister', [userAuthMiddleware.checkUserAlreadyAuthenticated, OTPMiddleware.checkOTPVerified], userController.getCompleteRegister);
router.post('/completeRegister', userController.postCompleteRegister);


//google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/user/login' }), userController.getGoogleCallback)


//User account route
router.get('/account', userAuthMiddleware.checkUserAuthenticated, userController.getAccount);
router.put('/account/updateProfile', userAuthMiddleware.validUser, userController.putAccount);
router.post('/account/changePassword', userAuthMiddleware.validUser, userController.postAccountChangePassword)

router.get('/forgetPassword', userController.getForgetPassword)
router.post('/forgetPassword', userController.postForgetPassword)
router.get('/resetPassword', OTPMiddleware.checkOTPVerified, userController.getResetPassword)
router.post('/resetPassword', userController.postResetPassword)


module.exports = router;