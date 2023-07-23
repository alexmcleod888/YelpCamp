//purpose: controller file contain functions for campgrounds based functionality

const Campground = require('../models/campground.js');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geoCoder = mbxGeocoding({
    accessToken: process.env.MAPBOX_TOKEN
})

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

module.exports.submitNewCampground = async (req, res, next) => {  

    
    const campground = new Campground(req.body.campground);

    //get the geographical coordinates
    const data = await geoCoder.forwardGeocode({
        query: campground.location,
        limit: 1
    }).send()

    //store geographic coordinates as geoJSON
    campground.geometry = data.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map( f => ({ url: f.path, filename: f.filename }));
    await campground.save();
    console.log(campground);
    req.flash('success', 'Campground Successfully Created!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.newCampgroundForm = (req, res, next) => {
    res.render('campgrounds/new.ejs');
}

module.exports.editCampgroundForm = async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit.ejs', { campground });
}

module.exports.showCampgroundsDetails = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({ 
        path : 'reviews', 
        populate : {
            path : 'author'
        }
    }).populate('author');
    res.render('campgrounds/show.ejs', { campground }); 
}

module.exports.updateCampground = async (req, res) => {
    console.log(req.body);
    const id = req.params.id;
    const deleteImages = req.body.deleteImages;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    let images = req.files.map( f => ({ url: f.path, filename: f.filename }))
    for(let image of images) {
        campground.images.push(image);
    }
    await campground.save();

    //deleting images
    if(deleteImages) {

        for(let i = 0; i < deleteImages.length; i++) {
            await cloudinary.uploader.destroy(deleteImages[i]);
        }

        for(let i = 0; i < campground.images.length; i++) {
            for(let j = 0; j < deleteImages.length; j++) {
                if(campground.images[i].filename === deleteImages[j]) {
                    await campground.updateOne({ $pull: { images: {filename: deleteImages[j]}}})
                }
            }
            
        }
    }
    
    req.flash('success', 'Campground Succcessfully Updated!');
    res.redirect(`/campgrounds/${id}`);
      
}

module.exports.deleteCampground = async (req,res) => {
    const id = req.params.id;
    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Successfully Deleted!')
    res.redirect ('/campgrounds');
     
}