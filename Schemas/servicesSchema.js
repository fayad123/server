const Joi = require("joi");

// feautureName item for the services array
const feauturesItemSchema = Joi.object({
	featureName: Joi.string(),
	price: Joi.number(),
});

// price schema based on priceType
const priceSchema = Joi.object({
	min: Joi.number().when("priceType", {
		is: "range",
		then: Joi.required(),
		otherwise: Joi.forbidden(),
	}),
	max: Joi.number().when("priceType", {
		is: "range",
		then: Joi.required(),
		otherwise: Joi.forbidden(),
	}),
});

// address schema
const addressSchema = Joi.object({
	city: Joi.string().required(),
	street: Joi.string().required(),
});

// main Service schema
const serviceValidationSchema = Joi.object({
	businessName: Joi.string().required(),
	email: Joi.string().email().required(),
	phone: Joi.string().required(),
	category: Joi.string().required(),
	images: Joi.array().items(Joi.string()),
	services: Joi.array().items(feauturesItemSchema),
	priceType: Joi.string().valid("fixed", "range").default("fixed"),
	price: priceSchema,
	description: Joi.string().allow(""),
	address: addressSchema,
	availableDates: Joi.array().items(Joi.date()),
	vendorId: Joi.string().required(),
});

module.exports = {serviceValidationSchema, addressSchema, feauturesItemSchema};
