const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const auth = require("../middlewares/auth");
const {hashSync, compareSync} = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const joi = require("joi");
const {loginJoiSchema} = require("../Schemas/userSchema");
const BusinessUsers = require("../models/BusinessUser");
const ObjectId = require("mongoose").Types.ObjectId;

const userJoiSchema = joi.object({
	name: joi.object({
		first: joi.string().required(),
		last: joi.string().required(),
	}),
	email: joi.string().email().required(),
	password: joi.string().min(8).required(),
	phone: joi.string().required(),
	pictures: joi.array(),
	address: joi.object({
		city: joi.string().required(),
		street: joi.string().required(),
	}),
});

// register new user
router.post("/", async (req, res) => {
	try {
		const {error} = userJoiSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		let user = await User.findOne({email: req.body.email});
		if (user) return res.status(400).send("This user already exists");

		const password = hashSync(req.body.password, 10);

		user = new User({...req.body, password: password});
		await user.save();

		const token = jwt.sign(
			_.pick(user, ["_id", "name.first", "email", "name.last", "role"]),
			process.env.JWT_SECRET,
		);

		res.status(201).send(token);
	} catch (err) {
		res.status(500).send(err);
	}
});

// get customers users for (Admin)
router.get("/customers", auth, async (req, res) => {
	try {
		if (req.payload.role !== "admin")
			return res.status(403).send("Access denied. Admins only");

		const users = await User.find().select("-password");
		if (!users.length) return res.status(404).send("No customer users found");

		res.status(200).send(users);
	} catch (error) {
		res.status(500).send(error);
	}
});

// get user for (vendor)
router.get("/for-vendors/:userId", auth, async (req, res) => {
	try {
		console.log("Role:", req.payload.role);
		if (req.payload.role !== "isVendor") {
			console.log("Access denied due to role");
			return res.status(403).send("Access denied");
		}

		if (!ObjectId.isValid(req.params.userId)) {
			return res.status(400).send("Invalid user ID");
		}

		console.log("Fetching user by id:", req.params.userId);

		const [user, vendor] = await Promise.all([
			User.findById(req.params.userId).select("-password").lean(),
			BusinessUsers.findById(req.params.userId).select("-password").lean(),
		]);

		const found = user || vendor;
		if (!found) {
			console.log("User and vendor not found");
			return res.status(404).send("User not found");
		}

		return res.status(200).json(found);
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).send(error.message);
	}
});

// login user
router.post("/login", async (req, res) => {
	try {
		const {error} = loginJoiSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const [user, businessUsers] = await Promise.all([
			User.findOne({email: req.body.email}).select("+password"),
			BusinessUsers.findOne({email: req.body.email})
		]);

		const foundUser = user || businessUsers;
		if (!foundUser) return res.status(400).send("User not exists");

		const validPassword = compareSync(req.body.password, foundUser.password);
		if (!validPassword) return res.status(400).send("Invalid email or password");
		const tokenPayload = {
			_id: foundUser._id,
			role: foundUser.role,
			email: foundUser.email,
			name: {
				first: foundUser.name?.first,
				last: foundUser.name?.last,
			},
			subscribtionData: foundUser.subscribtionData,
			userType: user ? "user" : "business",
		};

		if (foundUser.businessName && foundUser.category) {
			tokenPayload.businessName = foundUser.businessName;
			tokenPayload.category = foundUser.category;
			tokenPayload.subscribtionData = foundUser.subscribtionData;
		}

		const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {expiresIn: "7d"});
		res.status(200).send(token);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// update user
// router.put("/:userId", auth, async (req, res) => {
// 	try {
// 		if (req.payload.role !== "isAdmin" && req.payload._id !== req.params.userId)
// 			return res.status(403).send("Access denied. Admins only");

// 		const schemaToUse =
// 			req.body.role === "isVendor"
// 				? updatedBusinessUserJoiSchema
// 				: updatedUserJoiSchema;

// 		const {error} = schemaToUse.validate(req.body, {
// 			allowUnknown: true,
// 			presence: "optional",
// 		});
// 		if (error) return res.status(400).send(error.details[0].message);

// 		const updatedUser = await User.findByIdAndUpdate(
// 			req.params.userId,
// 			{$set: updateData},
// 			{new: true},
// 		).select("-password");

// 		if (!updatedUser) return res.status(404).send("User not found");

// 		res.status(200).send(updatedUser);
// 	} catch (err) {
// 		res.status(500).send(err.message);
// 	}
// });

// delete user by id
router.delete("/:userId", auth, async (req, res) => {
	try {
		if (req.payload.role !== "isAdmin")
			return res.status(403).send("Access denied. Admins only");

		const user = await User.findByIdAndDelete(req.params.userId);
		if (!user) return res.status(404).send("User not found");

		res.status(200).send("User has been deleted");
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
