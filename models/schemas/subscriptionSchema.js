const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
	{
		isSubscribed: {type: Boolean, default: false},
		planId: {
			type: String,
			enum: ["free", "basic", "gold", "premium", "enterprise"],
			default: "free",
		},
		subscriptionDate: {type: Date},
		expiryDate: {type: Date},
		recommendedServices: {type: Boolean, default: false},
	},
	{_id: false},
);

module.exports = subscriptionSchema;
