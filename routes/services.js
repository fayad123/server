const express = require("express");
const router = express.Router();
const Service = require("../models/Services");
const auth = require("../middlewares/auth");
const {feauturesItemSchema} = require("../Schemas/servicesSchema");

// gel all services
router.get("/", async (req, res) => {
	try {
		const services = await Service.find();
		res.status(200).send(services);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Add new picture
router.post("/picture/:vendorId", auth, async (req, res) => {
	try {
		if (!req.payload._id) return res.status(401).send("Unauthorized");

		let service = await Service.findOne({vendorId: req.params.vendorId});
		if (!service) return res.status(404).send("Service not found");
		service.images.push(req.body.image);

		await service.save();

		res.status(200).send(service);
	} catch (error) {
		res.status(500).send(error);
	}
});

// Get all services by userId (vendorId)
router.get("/:userId", auth, async (req, res) => {
	try {
		// Check if the logged-in user matches the userId in the params
		if (req.payload._id !== req.params.userId) {
			return res.status(403).send("Unauthorized");
		}

		// Find services by the vendorId (userId in the params)
		const services = await Service.find({vendorId: req.params.userId});

		if (services.length === 0) {
			return res.status(404).send("No services found for this user");
		}

		// Return services for the specific user (vendor)
		res.status(200).send(services);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// get vendor by vendorId
router.get("/vendor/:vendorId", async (req, res) => {
	try {
		const services = await Service.find({vendorId: req.params.vendorId});
		res.status(200).send(services);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// get services by categort
router.get("/by-category/:category", async (req, res) => {
	try {
		const services = await Service.find({category: req.params.category});
		res.status(200).send(services);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

// Create a new service
router.post("/:vendorId", auth, async (req, res) => {
	try {
		// validate body
		const {error} = feauturesItemSchema.validate(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Only admins and vendors can create services
		if (req.payload._id !== req.params.vendorId)
			return res.status(401).send("Access denied.");

		let service = await Service.findOne({vendorId: req.params.vendorId});

		// Create new service document for this vendor
		if (!service) {
			service = new Service({
				vendorId: req.params.vendorId,
				businessName: req.body.businessName || "",
				email: req.body.email || "",
				phone: req.body.phone || "",
				category: req.body.category || "",
				images: req.body.images || [],
				services: [],
				priceType: req.body.priceType || "fixed",
				price: req.body.price || {min: 0, max: 0},
				description: req.body.description || "",
				address: req.body.address || {city: "", street: ""},
				availableDates: req.body.availableDates || [],
			});
		}
		// Add the new service item
		service.services.push(req.body);
		await service.save();

		res.status(201).send(service);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

// Update vendor services
router.put("/:vendorId", auth, async (req, res) => {
	try {
		// Only vendors can update their services
		if (req.payload.role !== "isVendor" && req.payload._id !== req.params.vendorId) {
			return res.status(401).send("Access denied.");
		}

		let serviceToUpdate = await Service.findOneAndUpdate(
			{vendorId: req.params.vendorId},
			req.body,
			{new: true},
		);
		if (!serviceToUpdate)
			return res.status(404).send("vendor services is not defined");

		res.status(200).send(serviceToUpdate);
	} catch (error) {
		res.status(400).send(error.message);
	}
});

// Add new feature
router.delete("/:vendorId/:featureName", auth, async (req, res) => {
	try {
		let service = await Service.findOne({vendorId: req.params.vendorId});
		if (!service) return res.status(404).send("Service not found");

		const foundIndex = service.services.findIndex(
			(item) => item.featureName === req.params.featureName,
		);

		if (foundIndex === -1) return res.status(404).send("Feature not found");

		service.services.splice(foundIndex, 1);

		await service.save();

		res.status(200).send(service);
	} catch (error) {
		res.status(500).send(error.message);
	}
});

//search;
router.get("/search", async (req, res) => {
	try {
		const query = {};

		if (req.query.businessName) {
			// חיפוש לפי שם, רגולרי – לא רגיש לאותיות
			query.businessName = {$regex: req.query.businessName, $options: "i"};
		}

		if (req.query.category) {
			query.category = req.query.category;
		}

		if (req.query.city) {
			query["address.city"] = req.query.city;
		}

		if (req.query.minPrice || req.query.maxPrice) {
			query["price.min"] = {};
			if (req.query.minPrice) {
				query["price.min"].$gte = parseFloat(req.query.minPrice);
			}
			if (req.query.maxPrice) {
				query["price.min"].$lte = parseFloat(req.query.maxPrice);
			}
		}

		const services = await Service.find(query);

		if (!services.length) {
			return res.status(404).send("No matching services found");
		}

		res.status(200).send(services);
	} catch (err) {
		res.status(500).send(err.message);
	}
});

module.exports = router;
