const Listing = require("../models/listing");


//index route
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}

//new route
module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
}

//show route
module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author",
      },
     })
     .populate("owner");
    if(!listing){
      req.flash("error"," Listing you requested for doesn't exist !");
      res.redirect("/listings")
    }

    console.log(listing)
    res.render("listings/show.ejs", { listing });
}

//create route
module.exports.createListing=async (req, res, next) => {
      const newListing = new Listing(req.body.listing);
      newListing.owner=req.user._id;
      await newListing.save();
      req.flash("success","new Listing created !");
      res.redirect("/listings");
}

//edit route
module.exports.renderEditForm=async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing){
          req.flash("error", " Listing you requested for doesn't exist !");
          res.redirect("/listings")
        }
        res.render("listings/edit.ejs", { listing });
}

//update route
module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Updated !");
    
    res.redirect(`/listings/${id}`);
}

//delete route
module.exports.destroListing =async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted !");

  res.redirect("/listings");
}