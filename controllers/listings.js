const Listing = require('../models/listing');
const geocodingClient = require('../utils/mapbox');

//get index route - printing all list items
module.exports.index = async (req, res) => {
    let { search } = req.query;
    let allListings;
    if(search){
        allListings = await Listing.find({
            $or: [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    location: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    country: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        });
    } else {

        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListings });
}

//get new/create route - rendering form to create new listing
module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}

//post create/new route - adding new house to list  
module.exports.createListing = async (req,res,next)=>{

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.location,
            limit: 1
        })
        .send();

    if(!response.body.features.length){
        req.flash("error", "Location not found");
        return res.redirect("/listings/new");
    }

    let {title, description, price, location, country} = req.body;

    let listingData = new Listing({
        title,
        description,
        image: req.file
            ? {
                url: req.file.path,
                filename: req.file.filename,
            }
            : undefined,
        price,
        location,
        country,
        owner: req.user._id,
        geometry: response.body.features[0].geometry,
    });

    await listingData.save();

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
}

//get show route - showing specific house details 
module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    // console.log(listing);
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist")
        return res.redirect('/listings')
    }
    res.render("listings/show.ejs", { listing });
}

//update route - rendering form for updating the existing listing details
module.exports.renderEditForm = async (req,res) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist")
        return res.redirect('/listings')
    }
    res.render("listings/edit.ejs", {listing});
}

//patch update route - updating the existing house details
module.exports.updateListing = async (req,res)=>{

    let { id } = req.params;

    let { title, description, price, location, country } = req.body;

    let updatedListing = {
        title,
        description,
        price,
        location,
        country
    };

    // only update image if new image uploaded
    if(req.file){
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await Listing.findByIdAndUpdate(id, updatedListing);

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);
}

//delete - deleting the listings
module.exports.destroyListing = async (req,res)=>{
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect(`/listings`);
}
