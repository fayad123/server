const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middlewares/auth");
const Joi = require("joi");

const bookingSchema = Joi.object({
	date: Joi.string().isoDate().required(),
	services: Joi.array()
		.items(
			Joi.object({
				featureName: Joi.string().required(),
				price: Joi.number().required(),
			}),
		)
		.min(1)
		.required(),
	businessName: Joi.string().min(2).max(100).required(),
	note: Joi.string().allow("").max(500),
	vendorId: Joi.string().required(),
});

// create a new book
router.post("/", auth, async (req, res) => {
	try {
		if (!req.payload) return res.status(403).send("Access denied. No token provided");

		const {error} = bookingSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const newBooking = new Booking({
			...req.body,
			userId: req.payload._id,
		});

		await newBooking.save();

		const vendor = await BusinessUser.findById(req.body.vendorId);
		if (!vendor || !vendor.phone) {
			return res.status(400).send("Vendor phone number is missing");
		}

		let phone = vendor.phone.trim();
		if (phone.startsWith("0")) {
			phone = phone.slice(1);
		}
		phone = `+972${phone}`;

		const message = `تم إرسال الطلب لتاريخ ${
			req.body.date
		} مع الخدمات التالية: ${req.body.services.map((s) => s.featureName).join(", ")}
سيتم التواصل معك قريبًا لتأكيد الطلب ${vendor.phone}`;

		res.status(201).send(newBooking);
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error");
	}
});

// get booking dates for vendor user by vendorId
router.get("/:vendorId", async (req, res) => {
	try {
		const booking = await Booking.find({vendorId: req.params.vendorId});
		const dates = booking.map((b) => new Date(b.date));
		res.status(200).json({unavailableDates: dates});
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// get booking for user
router.get("/my-books/:userId", async (req, res) => {
	try {
		const userBooking = await Booking.find({userId: req.params.userId});
		if (!userBooking) return res.status(404).send("No bookings for this user");
		res.status(200).send(userBooking);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// get bookings for vendors
router.get("/vendor/:vendorId", async (req, res) => {
	try {
		const booking = await Booking.find({vendorId: req.params.vendorId});
		res.status(200).send(booking);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// delete book from ventors
router.delete("/:bookId", async (req, res) => {
	try {
		const booking = await Booking.findByIdAndDelete({_id: req.params.bookId});

		res.status(200).send(booking);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

// delete book from customers
router.delete("/customer/:bookId", async (req, res) => {
	try {
		const booking = await Booking.findByIdAndDelete({_id: req.params.bookId});

		res.status(200).send(booking);
	} catch (err) {
		res.status(500).send("Server error");
	}
});

module.exports = router;
