//HOW TO RUN:
//Ensure that you run mongod command in terminal to start the database
//then run nodemon app.js to start the application
//purpose: starting page where the express routes are defined
//dependencies: using bootrap version 5.0.0

//require the necessary modules
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
//allows us to plugin multiple stategies for authentication
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/User.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoDBStore = require("connect-mongo");

//dbURL = process.env.DB_URL

//'mongodb://localhost:27017/yelp-camp'
//connect to mongoose database

dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    //useCreateIndex: true, 
    useUnifiedTopology: true,
});

//creating a db reference variables to easily access mongoose.connection
const db = mongoose.connection;
//check if there is an error connecting
db.on('error', console.error.bind(console, "connection error:"));
//if there is no error then print database connected
db.once('open', () => {
    console.log("Database connected");
});

//reference to our express application
const app = express();

secret = process.env.SECRET || 'thisshouldbeabettersecret!';

//initialise ths mongo session store variable
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

//check for any errors 
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

//session setting config
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly: true,
        //secure: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7    
    }
}



app.use(session(sessionConfig));
//allows application to store flash memory
app.use(flash());
app.use(helmet());
//app.use(helmet({contentSecurityPolicy: false}));

const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtkg78bwn/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://source.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
//user local strategy that we downloaded and for that strategy the authentication model is located on our user model called authenticate
//we havnt made this method but passport-local-mongoose adds this to our class
passport.use(new localStrategy(User.authenticate()));
//how we store a user in a session
passport.serializeUser(User.serializeUser());
//how we unstore a user
passport.deserializeUser(User.deserializeUser());
//testing that it works
//allows req.body to be parsed
app.use(express.urlencoded({extended:true}));
//allows you to override the post request of a ejs form to be a different request handled in express
//ensure Mongo injection attacks dont occur by ignoring particular
//dangerous characters
app.use(mongoSanitize());
app.use(methodOverride('_method'));
//serve the public directory for use within the application
app.use(express.static(path.join(__dirname, 'public')));
//for the ejs engine use ejs-mate, dont use the default ejs engine
app.engine('ejs', ejsMate);
//set express options for view engine and where are views directory is
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
//middleware that is run before all routes checking whether any flash memory exists
//if it does it saved it to local variables for any templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//use the campgrounds routes 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);

//home page route
app.get('/', (req, res) => {
    res.render('home');
});

//matches all routes that havnt been defined and creates a new error and passes it to the error handling route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

//middleware that catches any errors that occur displaying the error message to the user
app.use((err, req, res, next) => {
    //destructures the elements of the error message. Setting default values if not given
    const { statusCode = 500 } = err;
    if(!err.message){
        err.message = 'something went wrong'
    }
    res.status(statusCode).render('error.ejs', { err });
});

port = process.env.PORT || 3000;
 
//checks whether the application is currently running
app.listen(port, () => {
    console.log(`listen on port ${port}`);
});