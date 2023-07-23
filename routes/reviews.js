//purpose: file containing reviews routes

const express = require('express');
const catchAsync = require('../utils/CatchAsync');
const reviews = require('../controllers/reviews.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

const router = express.Router({mergeParams: true});


//route for creating a new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.index));

//route for deleting a specific review from a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;