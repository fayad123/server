const mongoose = require("mongoose");

const bookingSettingsSchema = new mongoose.Schema(
	{
		maxBookingsPerDay: {
			type: Number,
			default: 1,
			min: 1,
		},
		allowOverlappingBookings: {
			type: Boolean,
			default: false,
		},
		bookingDurationInHours: {
			type: Number,
			default: 1,
			min: 0.25,
		},
		bookingType: {
			type: String,
			enum: ["daily", "hourly", "multi-booking"],
			default: "daily",
		},
	},
	{_id: false},
);

module.exports = bookingSettingsSchema;
