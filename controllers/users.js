//purpose: controller file containing functions for user based functionality

const User = require('../models/User.js');

module.exports.registerForm = (req, res) => { 
    res.render('user/register.ejs');
}

module.exports.submitRegisterForm = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) {
                return next(err);
            }
            else {
                req.flash('success', 'Welcome to Yelp Camp!');
                res.redirect('/campgrounds');
            }
        })
    }
    catch(e) {
        req.flash('error', e.message)
        res.redirect('/register');
    }    
}

module.exports.loginForm = (req, res) => {
    res.render('user/login.ejs')
}

module.exports.submitLoginForm = (req, res) => {
    req.flash('success', 'You have been logged in!')
    if(res.locals.returnTo) {
        const redirectUrl = res.locals.returnTo;
        res.redirect(redirectUrl);
    }
    else {
        res.redirect('/campgrounds')
    }
}

module.exports.logout = (req, res, next) => {
    req.logout((error) => {
        if(error) {
            next(error);
        }
        else {
            req.flash('success', 'Goodbye!');
            res.redirect('/campgrounds');
        }
        
    });   
}