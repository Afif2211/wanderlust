const Listing = require('../models/listing');
const Review = require('../models/review');

//post - creating review
module.exports.createReview = async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview._id);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review Posted!");
    res.redirect(`/listings/${listing._id}`);
}

//delete review
module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //reviews kee reviewId jo specific aa rhi hy osky related data pull kr dou array sy
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}