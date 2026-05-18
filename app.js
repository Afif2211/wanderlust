if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

// console.log(process.env.CLOUD_API_SECRET)
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3010;
const Listing = require('./models/listing')
const path = require("path");
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const {listingSchema, reviewSchema} = require('./schema');
const Review = require('./models/review');
const listings = require('./routes/listing');
const reviews = require('./routes/review');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const user = require('./routes/user');


const dbUrl = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connection successful");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.listen(port, ()=>{
    console.log(`Server listening on port: ${port}`);
})

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () => {
    console.log("Error in MONGO SESSION STORE ", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+7*24*60*60*1000, //7 days, 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(session(sessionOptions));
app.use(flash());


//for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //jo bhi users/request aein wo localStrategy ky according authenticate hn
passport.serializeUser(User.serializeUser()); //to store the info of user into session
passport.deserializeUser(User.deserializeUser()); //to remove the info of user from the session

//for flash message
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
})

//Add this middleware (prevents weird repeat behavior):
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

//creating route to check passport working

app.get('/demouser', async (req, res) => {
    let fakeUser = new User({
        email: "fake-email@gmail.com",
        username: "fake-username",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);

})

app.get('/', (req,res)=>{
    res.render("listings/home.ejs");
});



//for listing.js
app.use('/listings', listings);

//for reviews.js
app.use('/listings/:id/reviews', reviews);

//for users.js
app.use('/', user)

//custom error 
app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.render("listings/error.ejs", {message});
    // res.status(statusCode).send(message);

})






















// app.get('/testListing', async (req,res)=>{
//     const sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Testing Successful");
// })



// app.patch('/listings/:id', async (req,res)=>{
//     let { id } = req.params;

//     await Listing.findByIdAndUpdate(id, req.body);

//     res.redirect(`/listings/${id}`);
// });



//creating error middleware
// app.use((err, req, res, next)=>{
//     res.send("Something went wrong");
// })


//for all other paths
// app.all("/*splat", (req, res, next)=>{
//     next(new ExpressError(404, "Page not found"));
// })