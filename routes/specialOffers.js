const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {Service} = require("../models/Services");
const SpecialOffers = require("../models/SpecialOffers");
const Joi = require("joi");

const imageSchema = Joi.object({
	_id: Joi.string().allow(),
	url: Joi.string().uri().allow("").messages({
		"string.uri": "Image URL is not valid",
	}),
	alt: Joi.string().max(100).allow("").messages({
		"string.max": "Alt text cannot be longer than 100 characters",
	}),
}).unknown(true);

const serviceSchema = Joi.object({
	_id: Joi.string().allow(),
	featureName: Joi.string().max(150).required().messages({
		"string.empty": "Feature name is required",
		"string.max": "Feature name cannot be longer than 150 characters",
	}),
	price: Joi.number().min(0).required().messages({
		"number.base": "Price must be a number",
		"number.min": "Price must be at least 0",
		"any.required": "Price is required",
	}),
});

const specialOfferJoiSchema = Joi.object({
	_id: Joi.string().allow(),
	title: Joi.string().max(100).required().messages({
		"string.empty": "Title is required",
		"string.max": "Title cannot be longer than 100 characters",
	}),
	services: Joi.array().items(serviceSchema).min(1).required().messages({
		"array.min": "At least one service is required",
	}),
	images: Joi.array().items(imageSchema).default([]),
	vendorId: Joi.string().allow(""),
	businessName: Joi.string().max(100).allow(""),
	category: Joi.string().allow(""),
	note: Joi.string().max(500).allow(""),
});

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

// Fetch vendor offers by id
router.get("/vendors/:id", async (req, res) => {
	try {
		const offer = await SpecialOffers.find({vendorId: req.params.id});
		if (!offer) return res.status(404).send("Offers not found for this vendor");
		res.status(200).send(offer);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Create a new offer
router.post("/", auth, async (req, res) => {
	const {_id, businessName, category} = req.payload;

	try {
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

// إذا أحببت، أستطيع أن أعيد كتابة نسخة كاملة من EditOfferModal بحيث تكون جاهزة للاستخدام مباشرة مع parent list وتدعم:

// تحميل البيانات

// التحقق من الصحة

// تحديث العرض

// تحديث قائمة العروض في الـ parent بعد الحفظ

// هل تريد أن أفعل ذلك؟

// Edit an existing offer
router.put("/:id", async (req, res) => {
	const {error} = specialOfferJoiSchema.validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

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
router.delete("/:id", auth, async (req, res) => {
	try {
		const deletedOffer = await SpecialOffers.findByIdAndDelete(req.params.id);

		if (deletedOffer.vendorId !== req.payload._id && req.payload.role !== "isAdmin")
			return res.status(403).send("Unautorize");

		if (!deletedOffer) return res.status(404).send("Offer not found");

		res.status(200).send("Offer deleted successfully");
	} catch (err) {
		res.status(500).send(err.message);
	}
});

module.exports = router;
