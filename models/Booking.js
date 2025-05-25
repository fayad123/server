const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	date: {
		type: Date,
		required: true,
	},
	services: [
		{
			_id: {type: String},
			featureName: {type: String, required: true},
			price: {type: Number, required: true},
		},
	],
	userId: {
		type: String,
		required: true,
	},
	businessName: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ["Pending", "Approved", "Rejected", "Cancelled"],
		default: "Pending",
	},
	vendorId: {type: String, required: true},
	note: {type: String, default: ""},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
const Bookings = mongoose.model("Bookings", bookingSchema);

module.exports = Bookings;
