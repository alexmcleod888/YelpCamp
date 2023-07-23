//purpose: file containing user routes

const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users.js')
const catchAsync = require('../utils/CatchAsync.js');
const { storeReturnTo } = require("../middleware")


router.route('/register')
    //purpose: route that displays the register form
    .get(users.registerForm)
    //purpose: route that registers a new user 
    .post(catchAsync(users.submitRegisterForm))

router.route('/login')
    //purpose: route that displays the login form
    .get(users.loginForm)
    //purpose: logs in a user
    //use the storeReturnTo middleware to save the returnTo value from session to res.locals
    //passport.authenticate logs the user in and clears req.session
    // Now we can use res.locals.returnTo to redirect the user after login
    .post(storeReturnTo, passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), users.submitLoginForm);

//purpose: logs out a user
router.get('/logout', users.logout);

module.exports = router;