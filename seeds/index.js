//purpose: file that randomly seeds default campground locations

//require the necessary modules
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');


//connect to mongoose database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true, 
    useUnifiedTopology: true
})

//creating a db reference variables to easily access mongoose.connection
const db = mongoose.connection;
//check if there is an error connecting
db.on('error', console.error.bind(console, "connection error:"));
//if there is no error then print database connected
db.once('open', () => {
    console.log("Database connected");
})

//returns a random element from an array
let getRandom = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

//creates the database of campgrounds
const seedDb = async () => {
    await Campground.deleteMany({});
    //create 50 entries
    for(let i = 0; i < 300; i++) {
        //get a random number from 0 - 1000 to choose location
        let random1000 = Math.floor(Math.random() * 1000);
        let randomPrice = Math.floor(Math.random() * 20) + 10
        let newCampground = new Campground({ 
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            title: `${getRandom(descriptors)} ${getRandom(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dtkg78bwn/image/upload/v1685328117/YelpCamp/cuvxf88tkeknheihst8x.jpg',
                  filename: 'YelpCamp/cuvxf88tkeknheihst8x',
                },
                {
                  url: 'https://res.cloudinary.com/dtkg78bwn/image/upload/v1685328122/YelpCamp/l3tcwotfvltnphpc4hcb.jpg',
                  filename: 'YelpCamp/l3tcwotfvltnphpc4hcb',
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati saepe culpa modi animi dolorem reiciendis architecto fugiat et, odio ut illum, voluptates repellendus nesciunt. Exercitationem sit animi quasi odio eligendi!', 
            price: randomPrice,
            //YOUR USER ID 'rob'
            author: '64605c1719251d741caa2906',
            geometry: 
                { 
                    type: 'Point', 
                    coordinates: [ cities[random1000].longitude, 
                                   cities[random1000].latitude ] 
                }
        });
        await newCampground.save();
    }
}

//close database when done
seedDb().then( () => {
    mongoose.connection.close();
})