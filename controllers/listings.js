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
  }

  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

//create route
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
  .forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry =response.body.features[0].geometry;

  let savedListing=await newListing.save();
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
  }

  let originalImageUrl =listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

//update route
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if(typeof req.file !=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image= { url, filename };
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
