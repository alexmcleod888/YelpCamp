//purpose: creates the basic Campground Model for use within the application

//require mongoose for use
const mongoose = require('mongoose');
//./ means within the current directory
const Review = require('./review');
//create the Schema reference variable so it can be used more easily
const Schema = mongoose.Schema;

const ImageSchema = new Schema({ 
    url: String, 
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200,h_200');
})

//to enable mongoose to include virtuals when you convert document to JSON
const opts = { toJSON: { virtuals: true } }

//create the structure for the CampgroundsSchema
const CampgroundSchema = new Schema({
    title: String, 
    images: [ImageSchema],
    price: Number, 
    description: String, 
    location: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }    
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong>
                <a href="/campgrounds/${this._id}">${this.title}</a>
            </strong>
            <p>${this.description.substring(0,20)} ... </p>`
})


//middleware that deletes all the reviews for a specific campground when that campground is deleted
CampgroundSchema.post('findOneAndDelete', async (campground) => {
    if(campground) {
        //going through all the reviews in the database if
        //any review is equal to review within the campground
        //document that was deleted delete it.
        await Review.deleteMany({ _id : { $in: campground.reviews} });
    }
})

//export the compiled Campground model based on the CampgroundSchema schema
module.exports = mongoose.model('Campground', CampgroundSchema);