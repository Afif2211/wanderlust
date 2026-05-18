const Listing = require('./models/listing')
const Review = require('./models/review')
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {      //isAuthenticated return the current user/loggedIn user details if != then undefined if = then user details
        req.session.redirectUrl = req.originalUrl; //.originalUrl is the complete path and storing this path in session if user is not loggedIn
        req.flash("error", "You must be logged in first!")
        return res.redirect('/login');
    }
    next();
}

//passport session delete kr daita hy login time so humein pata nahi chaley ga user nay before login koun sa path access
//krny kee koshish kee that's why osko locals mein store krein gy takyy passport delete na kr sakay
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {          //agr hamaray req ky session mein kooi redirectUrl store hoa hy toh res.locals save kr loo
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//validation for review
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            throw new ExpressError(404, error)
        }
        else {
            next();
        }
}

//adding middleware to handle server side validation error
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            throw new ExpressError(404, error)
        }
        else {
            next();
        }
}