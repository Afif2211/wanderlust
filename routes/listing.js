const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync')
const ExpressError = require('../utils/ExpressError')
const Listing = require('../models/listing')
const {listingSchema, reviewSchema} = require('../schema')
const {isLoggedIn, isOwner, validateListing} = require('../middleware');
const listingController = require('../controllers/listings');
const multer  = require('multer');
const {storage} = require('../cloudConfig');
const upload = multer({storage});


//printing all list items - index route
router.get('/', wrapAsync(listingController.index));

//new/create route - rendering form to create new listing
router.get('/new', isLoggedIn, listingController.renderNewForm);

//create/new route - adding new house to list
router.post('/', isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingController.createListing))

//showing specific house details - show route
router.get('/:id', wrapAsync(listingController.showListing))

//update route - rendering form for updating the existing listing details
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))

//update route - updating the existing house details
router.patch('/:id', isLoggedIn, isOwner, upload.single('image'), wrapAsync(listingController.updateListing));

//delete - deleting the listings
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;