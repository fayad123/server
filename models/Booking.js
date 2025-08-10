const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		services: [
			{
				_id: {type: mongoose.Schema.Types.ObjectId, ref: "Service"},
				featureName: {type: String, required: true},
				price: {type: Number, required: true, min: 0},
			},
		],
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		vendorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "BusinessUser",
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
		note: {
			type: String,
			default: "",
			trim: true,
		},
	},
	{timestamps: true},
);

const Bookings = mongoose.model("Bookings", bookingSchema);

module.exports = Bookings;
