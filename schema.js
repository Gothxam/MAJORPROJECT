const joi= require("joi");


module.exports.listingSchema =joi.object({
  listing : joi.object().required({
      title : joi.string().required(),
      description : joi.string().required(),
      price : joi.number().required(),
      country : joi.string().required(),
      location : joi.string().required().min(0),
      image : joi.string().allow("",null)

  }).required(),
});