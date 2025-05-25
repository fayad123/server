const express = require("express");
const router = express.Router();
const BusinessUser = require("../models/BusinessUser");
const {hashSync, compareSync} = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const Service = require("../models/Services");
const Joi = require("joi");

const businessUserSchema = Joi.object({
	businessName: Joi.string().required(),
	phone: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().required(),
	images: Joi.array(),
	address: Joi.object({
		city: Joi.string().required().min(2),
		street: Joi.string().required().min(2),
	}),
	category: Joi.string().required(),
});

// Register new Business user
router.post("/", async (req, res) => {
	try {
		// validate body
		const {error} = businessUserSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// check if user exists
		let user = await BusinessUser.findOne({email: req.body.email}).select(
			"-password",
		);
		if (user) return res.status(400).send("This email user exists");

		// hash the password
		const password = hashSync(req.body.password, 10);

		// create new user
		user = new BusinessUser({...req.body, password: password});
		// save the user
		await user.save();

		let service = await Service.findOne({email: user.email});
		if (service) return res.status(400).send("this service is exists");

		service = new Service({
			businessName: user.businessName,
			email: user.email,
			phone: user.phone,
			category: user.category,
			images: [],
			services: [],
			description: "",
			priceType: "fixed",
			price: {
				min: 0,
				max: 0,
			},
			address: {
				city: user.address.city,
				street: user.address.street,
			},
			availableDates: [],
			vendorId: user._id.toString(),
		});
		await service.save();

		// create token
		const token = jwt.sign(
			_.pick(user, ["_id", "businessName", "role"]),
			process.env.JWT_SECRET,
		);

		// send the token as response
		res.status(201).send(token);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

module.exports = router;
