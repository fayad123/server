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

const updatedBusinessUserJoiSchema = joi
	.object({
		name: {
			first: joi.string().required(),
			last: joi.string().required(),
		},
		phone: joi.string().required(),
		address: joi.object({
			city: joi.string().required(),
			street: joi.string().required(),
		}),
		category: joi.string().min(2),
		businessName: joi.string(),
	})

const loginJoiSchema = joi.object({
	email: joi.string().email().required(),
	password: joi.string().required(),
});

module.exports = {
	loginJoiSchema,
	updatedBusinessUserJoiSchema,
	updatedUserJoiSchema,
};
