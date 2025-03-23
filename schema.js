const joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = joi.object({
  listing: joi
    .object()
    .required({
      title: joi.string().required(),
      description: joi.string().required(),
      price: joi.number().required(),
      country: joi.string().required(),
      location: joi.string().required().min(0),
      image: joi.string().allow("", null),
    })
    .required(),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      Comment: joi.string().required(),
    })
    .required(),
});
