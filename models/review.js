//purpose: creates the basic Review Model for use within the application

//require mongoose for use
const mongoose = require('mongoose');
//create the Schema reference variable so it can be used more easily
const Schema = mongoose.Schema;

//create the review schema
const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

//export the compiled Campground model based on the CampgroundSchema schema
module.exports = mongoose.model('Review', ReviewSchema);