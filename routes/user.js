const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const isLoggedIn = require('../middleware');
const {saveRedirectUrl} = require('../middleware');
const userController = require('../controllers/users');

//show - rendering a form for signup
router.get('/signup', userController.renderSignupForm)

//create - creating a new user
router.post('/signup', wrapAsync (userController.signup))

//show - rendering a form for login
router.get('/login', userController.renderLoginForm)


//post - sending user login details
router.post('/login', saveRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), 
userController.login)


//logout user
router.get('/logout', userController.logout)


module.exports = router;