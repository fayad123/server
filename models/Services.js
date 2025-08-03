const mongoose = require("mongoose");
const workingHoursSchema = require("./schemas/workingHoursSchema");
const dayScheduleSchema = require("./schemas/dayScheduleSchema");

const serviceSchema = new mongoose.Schema(
	{
		businessName: {type: String, required: true},
		email: {type: String, required: true},
		phone: {type: String, required: true},
		category: {type: String, required: true, index: true},
		images: {
			type: [
				{
					url: String,
					alt: String,
				},
			],
			default: [],
		},
		socialMediaLinks: {
			facebook: {type: String, default: ""},
			instagram: {type: String, default: ""},
			tikTok: {type: String, default: ""},
			x: {type: String, default: ""},
			youtube: {type: String, default: ""},
		},
		services: {
			type: [
				{
					featureName: {type: String, required: true},
					price: {type: Number, required: true},
				},
			],
			default: [],
		},
		priceType: {
			type: String,
			enum: ["fixed", "range"],
			default: "range",
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
			index: true,
			required: true,
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
			type: workingHoursSchema,
			default: () => ({}),
		},
	},
	{timestamps: true},
);

const Service = mongoose.model("Service", serviceSchema);

function createDefaultServiceFromUser(user) {
	return new Service({
		businessName: user.businessName,
		email: user.email,
		phone: user.phone,
		category: user.category,
		images: user.images || [],
		socialMediaLinks: {
			facebook: "",
			instagram: "",
			tikTok: "",
			x: "",
			youtube: "",
		},
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
		maxBookingsPerDay: 1,
		allowOverlappingBookings: false,
		bookingDurationInHours: 2,
		bookingType: "daily",
	});
}

module.exports = {
	Service,
	createDefaultServiceFromUser,
};
