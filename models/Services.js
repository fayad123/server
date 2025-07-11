const mongoose = require("mongoose");
const workingHoursSchema = require("./schemas/workingHoursSchema");
const dayScheduleSchema = require("./schemas/dayScheduleSchema");

const serviceSchema = new mongoose.Schema(
	{
		businessName: {type: String, required: true},
		email: {type: String, required: true},
		phone: {type: String, required: true},
		category: {type: String, required: true, index: true},
		images: [
			{
				url: {type: String},
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
