const Review = require('../models/review.js');
const Campground = require('../models/campground.js');

module.exports.index = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save()
    req.flash('success', 'Review Successfully Created!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params; 
    //$pull operator removes anything within a given array that equals a given value
    await Campground.findByIdAndUpdate(id, { $pull : { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Successfully Deleted!')
    res.redirect(`/campgrounds/${id}`);
}