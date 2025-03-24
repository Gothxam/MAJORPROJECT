// 51.1
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js")

// 51.1. routes pasted from app.js & all request i.e app.get changed to router.get

//index and create route
router.route("/")
.get( wrapAsync(listingController.index))
.post(
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListing)
);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show,update and delete route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOwner, 
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroListing)
);

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router; //exported to app.js
