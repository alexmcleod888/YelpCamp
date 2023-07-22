const express = require('express')
const catchAsync = require('../utils/CatchAsync');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
const upload = multer({ storage });



const { isLoggedIn, validateCampground, campgroundExists, isAuthor } = require('../middleware.js');

const router = express.Router();


router.route('/')
    //route to the main campgrounds home page where all campgrounds are displayed
    .get(catchAsync(campgrounds.index))
    //route where the form request is submitted creating a new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.submitNewCampground))

//route that takes user to the new campgrouds form
router.get('/new', isLoggedIn, campgrounds.newCampgroundForm);

router.route('/:id')
    //route that takes you to the details page of the campgrounds you have selected
    .get(campgroundExists, catchAsync(campgrounds.showCampgroundsDetails))
    //route that updates the old values of the campground being edited and updates the database
    //it then redirects back to the show page of the edited campground
    .put(isLoggedIn, campgroundExists, isAuthor, upload.array('image'), validateCampground,  catchAsync(campgrounds.updateCampground))
    //route that delete a specified campground
    .delete(isLoggedIn, campgroundExists, isAuthor, catchAsync (campgrounds.deleteCampground))



//route that takes user to the edit campgrounds form
router.get('/:id/edit', isLoggedIn, campgroundExists, isAuthor, catchAsync(campgrounds.editCampgroundForm));





module.exports = router;