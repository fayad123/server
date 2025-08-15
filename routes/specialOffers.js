// routes/specialOffers.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {Service} = require("../models/Services");
const SpecialOffers = require("../models/SpecialOffers");

// get all offers
router.get("/", async (req, res) => {
	try {
		const offers = await SpecialOffers.find();
		res.status(200).send(offers);
	} catch (err) {
		res.status(500).json({message: err.message});
	}
});

// Fetch one view by id
router.get("/:id", async (req, res) => {
	try {
		const offer = await SpecialOffers.findById(req.params.id).populate(
			"vendorId",
			"businessName",
		);
		if (!offer) return res.status(404).send("Offer not found");
		res.status(200).send(offer);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Create a new offer
// router.post("/", auth, async (req, res) => {
// 	const {_id, businessName, category} = req.payload;
// 	try {
// 		const newOffer = new SpecialOffers({
// 			...req.body,
// 			vendorId: _id,
// 			businessName,
// 			category,
// 		});
// 		const savedOffer = await newOffer.save();
// 		res.status(201).send(savedOffer);
// 	} catch (err) {
// 		res.status(400).send(err.message);
// 	}
// });

// Create a new offer
router.post("/", auth, async (req, res) => {
	const { _id, businessName, category } = req.payload;

	try {
		// إنشاء عرض جديد
		const newOffer = new SpecialOffers({
			...req.body,
			vendorId: _id,
			businessName,
			category,
		});

		const savedOffer = await newOffer.save();

		res.status(201).send(savedOffer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});


// Edit an existing offer
router.put("/:id", async (req, res) => {
	try {
		const updatedOffer = await SpecialOffers.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true, runValidators: true},
		);
		if (!updatedOffer) return res.status(404).send("Offer not found");
		res.status(200).send(updatedOffer);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

//  Remove width offer by id
router.delete("/:id", async (req, res) => {
	try {
		const deletedOffer = await SpecialOffers.findByIdAndDelete(req.params.id);
		if (!deletedOffer) return res.status(404).send("Offer not found");
		res.status(200).send("Offer deleted successfully");
	} catch (err) {
		res.status(500).send(err.message);
	}
});

module.exports = router;
