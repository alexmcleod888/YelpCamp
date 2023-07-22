const catchAsync = require('./utils/CatchAsync.js');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const Review = require('./models/review.js')

//purpose: method that checks that someone is logged in 
module.exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    }
    else {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in!')
        res.redirect('/login');
    }
}

//purpose: a middleware that uses a joi object to validate the 
//new campgrounds
module.exports.validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
} 

//purpose: a middleware that uses a joi object to validate the 
//new reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
}


//purpose: checks that a campground still exists before performing operations
module.exports.campgroundExists = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if(!campground) {
        req.flash('error', 'Error: Campground Does Not Exist!')
        res.redirect('/campgrounds');
    }
    else {
        next();
    }
})

//purpose: middleware function that you have permission as an author of a campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        res.redirect(`/campgrounds/${id}`);
    }
    else {
        next();
    }
}

//purpose: checks if the current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        res.redirect(`/campgrounds/${reviewId}`);
    }
    else {
        next();
    }
}


module.exports.storeReturnTo = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}