const joi = require("joi");

// users
const updatedUserJoiSchema = joi
	.object({
		name: joi.object({
			first: joi.string().required(),
			last: joi.string().required(),
		}),
		phone: joi.string().required(),
		address: joi.object({
			city: joi.string().required(),
			street: joi.string().required(),
		}),
	})

const updatedBusinessUserJoiSchema = joi.object({
	businessName: joi.string().required(),
	phone: joi.string().required(),
	category: joi.string().required(),
	description: joi.string().allow(""),
	priceType: joi.string().valid("fixed", "variable").required(),
	price: joi.object({
		min: joi.number().min(0).required(),
		max: joi.number().min(joi.ref("min")).required(),
	}),
	address: joi.object({
		city: joi.string().required(),
		street: joi.string().required(),
	}),
	maxBookingsPerDay: joi.number().min(1).required(),
	allowOverlappingBookings: joi.boolean().required(),
	bookingDurationInHours: joi.number().min(0.5).required(),
	bookingType: joi.string().valid("daily", "hourly", "multi-booking").required(),
	workingHours: joi
		.object({
			sunday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			monday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			tuesday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			wednesday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			thursday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			friday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
			saturday: joi.object({
				from: joi.string(),
				to: joi.string(),
				closed: joi.boolean(),
			}),
		})
		.required(),
});

const loginJoiSchema = joi.object({
	email: joi.string().email().required(),
	password: joi.string().required(),
});

module.exports = {
	loginJoiSchema,
	updatedBusinessUserJoiSchema,
	updatedUserJoiSchema,
};
