const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken =process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

//index route
module.exports.index = async (req, res) => {
  const { category, search } = req.query; // Extract 'search' and 'category' from query parameters
  let query = {};

  // Filter by category if provided
  if (category && category !== "") {
    query.category = category;
  }

  // Add search functionality
  if (search && search.trim() !== "") {
    query.title = { $regex: search, $options: "i" }; // Search by title (case-insensitive)
  }

  try {
    const allListings = await Listing.find(query); // Fetch listings based on the query
    res.render("listings/index.ejs", { allListings, query: req.query }); // Pass 'req.query' as 'query'
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//new route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

//show route
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", " Listing you requested for doesn't exist !");
    res.redirect("/listings");
    return;
  }

  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

//create route
module.exports.createListing = async (req, res, next) => {
  // Try geocoding the provided location. If Mapbox rejects the token or the
  // request fails for any reason, catch the error and continue — we still
  // allow creating a listing, but without geometry.
  response = null;
  try {
    response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();
  } catch (e) {
    console.error("Mapbox geocoding failed:", e && e.message);
    // Inform the user but continue — location will be saved without geometry
    req.flash(
      "error",
      "Geocoding failed (Mapbox token may be invalid). The listing will be created without a map location."
    );
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // Attach uploaded image only if present
  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    newListing.image = { url, filename };
  }

  // Set geometry only when geocoding returned a valid feature
  if (
    response &&
    response.body &&
    Array.isArray(response.body.features) &&
    response.body.features.length > 0
  ) {
    newListing.geometry = response.body.features[0].geometry;
  } else {
    newListing.geometry = null;
  }

  let savedListing = await newListing.save();
  console.log(savedListing);
  
  req.flash("success", "new Listing created !");
  res.redirect("/listings");
};

//edit route
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", " Listing you requested for doesn't exist !");
    res.redirect("/listings");
    return;
  }
  // Guard: image may be missing
  let originalImageUrl = null;
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

//update route
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // If listing wasn't found, bail out
  if (!listing) {
    req.flash("error", " Listing you requested for doesn't exist !");
    return res.redirect("/listings");
  }

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated !");

  res.redirect(`/listings/${id}`);
};

//delete route
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted !");

  res.redirect("/listings");
};
