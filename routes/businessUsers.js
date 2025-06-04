const express = require("express");
const router = express.Router();
const BusinessUser = require("../models/BusinessUser");
const {hashSync} = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const Service = require("../models/Services");
const Joi = require("joi");
const auth = require("../middlewares/auth");

const businessUserSchema = Joi.object({
	businessName: Joi.string().required(),
	phone: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8)
		.max(30)
		.pattern(
			new RegExp(
				"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).+$",
			),
		)
		.message(
			"Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
		)
		.required(),
	images: Joi.array(),
	address: Joi.object({
		city: Joi.string().required().min(2),
		street: Joi.string().required().min(2),
	}),
	category: Joi.string().required(),
	isSubscribed: Joi.boolean(),
	planId: Joi.string()
		.valid("free", "basic", "gold", "premium", "enterprise")
		.default("free"),
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
			recommendedServices: false,
			maxBookingsPerDay: 1,
			allowOverlappingBookings: false,
			bookingDurationInHours: 2,
			bookingType: "daily",
			workingHours: {
				sunday: {from: "09:00", to: "17:00", closed: false},
				monday: {from: "09:00", to: "17:00", closed: false},
				tuesday: {from: "09:00", to: "17:00", closed: false},
				wednesday: {from: "09:00", to: "17:00", closed: false},
				thursday: {from: "09:00", to: "17:00", closed: false},
				friday: {from: "10:00", to: "14:00", closed: false},
				saturday: {closed: true},
			},
		});
		await service.save();

		// create token
		const token = jwt.sign(
			_.pick(user, [
				"_id",
				"businessName",
				"email",
				"planId",
				"role",
				"isSubscribed",
				"subscriptionDate",
				"expiryDate",
			]),
			process.env.JWT_SECRET,
			{expiresIn: "1d"},
		);

		// send the token as response
		res.status(201).send(token);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

const planeSchema = Joi.object({
	isSubscribed: Joi.boolean().required(),
	planId: Joi.string()
		.valid("free", "basic", "gold", "premium", "enterprise")
		.required(),
});

// get all vindors user for (Admin)
router.get("/vendors", auth, async (req, res) => {
	try {
		if (req.payload.role !== "admin")
			return res.status(403).send("Access denied. Admins only");

		const users = await BusinessUser.find().select("-password");
		if (!users.length) return res.status(404).send("No vendor users found");

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// get user subscription
router.get("/:vendorId", async (req, res) => {
	try {
		// עדכון בבסיס הנתונים
		const vendorPlane = await BusinessUser.findById(req.params.vendorId, {
			planId: 1,
		}).select("-password");
		if (!vendorPlane) return res.status(404).send("Vendor subscription not found");

		res.status(200).send(vendorPlane);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// Update user subscription
router.patch("/:vendorId", auth, async (req, res) => {
	try {
		// validate body
		const {error, value} = planeSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const planDurations = {
			free: 0,
			basic: 30,
			gold: 30,
			premium: 30,
			enterprise: 30,
		};

		const getExpiryDate = (planId) => {
			const duration = planDurations[planId];
			if (duration === undefined) return null;

			const expiryDate = new Date();
			expiryDate.setDate(expiryDate.getDate() + duration);
			return expiryDate;
		};

		const updateData = {
			isSubscribed: value.isSubscribed,
			planId: value.planId,
		};

		// אם רוצים להירשם
		if (value.isSubscribed) {
			if (value.planId === "free") {
				return res.status(400).json({
					success: false,
					message: "Cannot subscribe to the free package",
				});
			}

			const expiry = getExpiryDate(value.planId);
			if (!expiry) {
				return res.status(400).json({
					error: "Invalid planId or expiry date calculation failed",
				});
			}

			updateData.subscriptionDate = new Date();
			updateData.expiryDate = expiry;
		} else {
			// אם ביטלו את המנוי
			updateData.expiryDate = null;
			updateData.subscriptionDate = null;
		}

		// עדכון בבסיס הנתונים
		const vendorUser = await BusinessUser.findByIdAndUpdate(
			req.params.vendorId,
			{$set: updateData},
			{new: true, runValidators: true},
		).select("-password");

		if (!vendorUser) return res.status(404).send("Vendor not found");

		// create a new token
		const token = jwt.sign(
			_.pick(vendorUser, [
				"_id",
				"businessName",
				"email",
				"planId",
				"isSubscribed",
				"subscriptionDate",
				"expiryDate",
				"role",
			]),
			process.env.JWT_SECRET,
			{expiresIn: "1d"},
		);

		res.status(200).json({
			success: true,
			message: `Subscription updated successfully to ${updateData.planId}`,
			vendor: vendorUser,
			token: token,
		});
	} catch (error) {
		res.status(500).send(error.message);
	}
});

module.exports = router;
