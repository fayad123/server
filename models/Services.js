const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
	{
		businessName: {type: String, required: true},
		email: {type: String, required: true},
		phone: {type: String, required: true},
		category: {type: String, required: true, index: true},
		images: [
			{
				url: {type: String, url: true},
				alt: {type: String},
			},
		],
		services: [
			{
				featureName: {type: String, required: true},
				price: {type: Number, required: true},
			},
		],
		priceType: {
			type: String,
			enum: ["fixed", "range"],
			default: "fixed",
		},
		price: {
			min: {type: Number},
			max: {type: Number},
		},
		description: {type: String},
		address: {
			city: {type: String, required: true, index: true},
			street: {type: String, required: true},
		},
		availableDates: [{type: Date}],
		vendorId: {
			type: String,
			required: true,
		},
		planeId: {
			type: String,
		},
		maxBookingsPerDay: {type: Number, default: 1},
		allowOverlappingBookings: {type: Boolean, default: false},
		bookingDurationInHours: {type: Number, default: 1},
		bookingType: {
			type: String,
			enum: ["daily", "hourly", "multi-booking"],
			default: "daily",
		},
		workingHours: {
			type: Object,
			default: {
				sunday: {from: "09:00", to: "17:00", closed: false},
				monday: {from: "09:00", to: "17:00", closed: false},
				tuesday: {from: "09:00", to: "17:00", closed: false},
				wednesday: {from: "09:00", to: "17:00", closed: false},
				thursday: {from: "09:00", to: "17:00", closed: false},
				friday: {closed: true},
				saturday: {closed: true},
			},
		},
	},
	{timestamps: true},
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
