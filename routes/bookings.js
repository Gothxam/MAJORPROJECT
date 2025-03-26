const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware"); // Import the middleware

// POST route to create a booking
router.post("/:id/book", isLoggedIn, async (req, res) => {
  const { id } = req.params; // Listing ID
  const { startDate, endDate } = req.body; // Booking dates

  try {
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }
    console.log("Listing Found:", listing);

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      req.flash("error", "End date must be after start date.");
      return res.redirect(`/listings/${id}`);
    }

    // Calculate total price (price per night * number of nights)
    const nights = (end - start) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
    const totalPrice = listing.price * nights;

    console.log("Total Nights:", nights);
    console.log("Total Price:", totalPrice);

    // Create a new booking
    const booking = new Booking({
      listing: id,
      user: req.user._id, // Assuming user is logged in
      startDate: start,
      endDate: end,
      totalPrice,
    });

    await booking.save();
    console.log("Booking Created:", booking);

    req.flash("success", "Booking created successfully!");
    res.redirect(`/bookings/checkout/${booking._id}`); // Redirect to checkout page
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect(`/listings/${id}`);
  }
});

// GET route to display the checkout page
router.get("/checkout/:bookingId", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking by ID and populate the related listing and user
    const booking = await Booking.findById(bookingId).populate("listing").populate("user");
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/listings");
    }

    // Render the checkout page
    res.render("listings/checkout", { booking });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/listings");
  }
});

module.exports = router;