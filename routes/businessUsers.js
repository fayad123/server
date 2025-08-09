const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const BusinessUsers = require("../models/BusinessUser");
const {hashSync} = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const {Service} = require("../models/Services");
const Joi = require("joi");
const auth = require("../middlewares/auth");
const {createDefaultServiceFromUser} = require("../models/Services");

const planeSchema = Joi.object({
	isSubscribed: Joi.boolean().required(),
	planId: Joi.string()
		.valid("free", "basic", "gold", "premium", "enterprise")
		.required(),
	subscriptionDate: Joi.date(),
	expiryDate: Joi.date(),
	recommendedServices: Joi.boolean(),
});

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
	subscriptionData: planeSchema,
});

// Register new Business user
router.post("/", async (req, res) => {
	try {
		// validate body
		const {error} = businessUserSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// check if user exists
		let user = await BusinessUsers.findOne({email: req.body.email}).select(
			"-password",
		);
		if (user) return res.status(400).send("This email user exists");

		// hash the password
		const password = hashSync(req.body.password, 10);

		// create new user
		user = new BusinessUsers({...req.body, password: password});
		// save the user
		await user.save();

		await createDefaultServiceFromUser(user);

		// create token
		const token = jwt.sign(
			_.pick(user, ["_id", "businessName", "email", "role", "subscriptionData"]),
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

// Get recommended services with proper vendor data
router.get("/recommended-services", async (req, res) => {
	try {
		// Find vendors who have recommended services
		const vendors = await BusinessUsers.find({
			"subscriptionData.recommendedServices": true,
		}).select("-password");

		if (!vendors || vendors.length === 0) {
			return res.status(404).send("No recommended services found");
		}

		// Extract and flatten services
		const venIds = vendors.map((v) => v._id);
		const services = await Service.find({vendorId: {$in: venIds}}).lean();
		const servicess = services.map((vendor) => ({
			_id: vendor._id,
			vendorId: vendor._id,
			businessName: vendor.businessName,
			email: vendor.email,
			phone: vendor.phone,
			category: vendor.category,
			address: vendor.address,
			description: vendor.description || "",
			images: vendor.images || [],
			socialMediaLinks: vendor.socialMediaLinks,
			price: vendor.price || {min: 0, max: 0},
			priceType: vendor.priceType || "",
			services: vendor.services || [],
		}));
		res.status(200).send(servicess);
	} catch (error) {
		console.error("Error fetching recommended services:", error);
		res.status(500).send(error.message);
	}
});

// get all vindors user for (Admin)
router.get("/vendors", auth, async (req, res) => {
	try {
		if (req.payload.role !== "admin")
			return res.status(403).send("Access denied. Admins only");

		const users = await BusinessUsers.find().select("-password");
		if (!users.length) return res.status(404).send("No vendor users found");

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// get vendor by id
router.get("/vendor/:vendorId", async (req, res) => {
	try {
		const vendor = await BusinessUsers.findById(req.params.vendorId).select(
			"subscriptionData",
		);

		if (!vendor) {
			return res.status(404).send("Vendor not found");
		}

		if (!vendor.subscriptionData) {
			return res.status(404).send("Vendor subscription not found");
		}

		const {planId, isSubscribed, expiryDate, subscriptionDate, recommendedServices} =
			vendor.subscriptionData;

		res.status(200).json({
			planId,
			isSubscribed,
			expiryDate: expiryDate instanceof Date ? expiryDate : null,
			subscriptionDate: subscriptionDate instanceof Date ? subscriptionDate : null,
			recommendedServices,
		});
	} catch (error) {
		res.status(500).send(error.message);
	}
});

// router.get("/vendorSubscription/:vendorId", auth, async (req, res) => {
// 	if (req.payload.role !== "admin") return res.status(401).send("Not authorized");
// 	try {
// 		const vendor = await BusinessUsers.findById(req.params.vendorId).select(
// 			"-password",
// 		);
// 		if (!vendor) return res.status(404).send("Vendor not found");

// 		res.status(200).send(vendor);
// 	} catch (error) {
// 		res.status(500).send(error.message);
// 	}
// });

// get vendor subscription
router.get("/vendorSubscriptionData/:vendorId", auth, async (req, res) => {
	try {
		if (req.payload.role !== "admin" && req.payload._id !== req.params.vendorId) {
			return res.status(403).send("Admin access required");
		}

		const vendor = await BusinessUsers.findById(req.params.vendorId);

		if (!vendor) {
			return res.status(404).send("Vendor not found");
		}
		const subscriptionData = vendor.subscriptionData;
		res.status(200).send(subscriptionData);
	} catch (error) {
		res.status(500).json({error: "Internal server error"});
	}
});

// Update user subscription
// router.patch("/vendor/subscribe/:vendorId", auth, async (req, res) => {
// 	try {
// 		if (req.payload._id !== req.params.vendorId && req.payload.role !== "admin")
// 			return res.status(401).send("Unauthorized");

// 		// validate body
// 		const {error, value} = planeSchema.validate(req.body);
// 		if (error) return res.status(400).send(error.details[0].message);

// 		const planDurations = {
// 			free: 0,
// 			basic: 30,
// 			gold: 30,
// 			premium: 30,
// 			enterprise: 30,
// 		};

// 		const getExpiryDate = (planId) => {
// 			const duration = planDurations[planId];
// 			if (duration === undefined) return null;

// 			const expiryDate = new Date();
// 			expiryDate.setDate(expiryDate.getDate() + duration);
// 			return expiryDate;
// 		};

// 		if (!mongoose.Types.ObjectId.isValid(req.params.vendorId)) {
// 			return res.status(400).send("Invalid vendor ID format.");
// 		}

// 		const updateData = {
// 			isSubscribed: value.isSubscribed,
// 			planId: value.planId,
// 			recommendedServices: ["premium", "enterprise"].includes(value.planId),
// 			subscriptionDate: null,
// 			expiryDate: null,
// 		};

// 		// אם רוצים להירשם
// 		if (value.isSubscribed) {
// 			if (value.planId === "free") {
// 				return res.status(400).json({
// 					success: false,
// 					message: "Cannot subscribe to the free package",
// 				});
// 			}

// 			const expiry = getExpiryDate(value.planId);
// 			if (!expiry) {
// 				return res.status(400).json({
// 					error: "Invalid planId or expiry date calculation failed",
// 				});
// 			}

// 			updateData.subscriptionDate = new Date();
// 			updateData.expiryDate = expiry;
// 		} else {
// 			// אם בבוטל את המנוי
// 			updateData.expiryDate = null;
// 			updateData.subscriptionDate = null;
// 		}

// 		// update user plan
// 		await BusinessUsers.findByIdAndUpdate(
// 			req.params.vendorId,
// 			{
// 				$set: {
// 					"subscriptionData.isSubscribed": updateData.isSubscribed,
// 					"subscriptionData.planId": updateData.planId,
// 					"subscriptionData.subscriptionDate": updateData.subscriptionDate,
// 					"subscriptionData.expiryDate": updateData.expiryDate,
// 					"subscriptionData.recommendedServices":
// 						updateData.recommendedServices,
// 				},
// 			},
// 			{new: true, runValidators: true},
// 		);

// 		if (!vendorUser) return res.status(404).send("Vendor not found");

// 		const payload = {
// 			_id: vendorUser._id,
// 			businessName: vendorUser.businessName,
// 			email: vendorUser.email,
// 			role: vendorUser.role,
// 			subscriptionData: vendorUser.subscriptionData,
// 		};

// 		// create a new token
// 		const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"});

// 		res.status(200).json({
// 			vendor: vendorUser,
// 			token: token,
// 		});
// 	} catch (error) {
// 		console.error("Update error:", error);
// 		res.status(500).send(error.message);
// 	}
// });
// Update user subscription
router.patch("/vendor/subscribe/:vendorId", auth, async (req, res) => {
	try {
		const vendorId = req.params.vendorId;

		// בדיקת הרשאות: רק המשתמש עצמו או מנהל יכול לעדכן
		if (req.payload._id !== vendorId && req.payload.role !== "admin") {
			return res.status(401).send("Unauthorized");
		}

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
			recommendedServices: ["premium", "enterprise"].includes(value.planId),
			subscriptionDate: null,
			expiryDate: null,
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
			// מבטל את המנוי
			updateData.subscriptionDate = null;
			updateData.expiryDate = null;
		}

		const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

		const vendorUser = await BusinessUsers.findOneAndUpdate(
			{_id: vendorId},
			{
				$set: {
					"subscriptionData.isSubscribed": updateData.isSubscribed,
					"subscriptionData.planId": updateData.planId,
					"subscriptionData.subscriptionDate": updateData.subscriptionDate,
					"subscriptionData.expiryDate": updateData.expiryDate,
					"subscriptionData.recommendedServices":
						updateData.recommendedServices,
				},
			},
			{new: true, runValidators: true},
		);

		if (!vendorUser) {
			console.log("Vendor not found for ID:", vendorId);
			return res.status(404).send("Vendor not found");
		}

		const payload = {
			_id: req.payload._id,
			businessName: vendorUser.businessName,
			email: vendorUser.email,
			role: vendorUser.role,
			subscriptionData: vendorUser.subscriptionData,
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"});

		res.status(200).json({
			vendor: vendorUser,
			token,
		});
	} catch (error) {
		console.error("Update error:", error);
		res.status(500).send(error.message);
	}
});

module.exports = router;
