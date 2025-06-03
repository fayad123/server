const mongoose = require("mongoose");

const businessUserSchema = new mongoose.Schema(
	{
		businessName: {type: String, required: true},
		phone: {type: String, required: true},
		email: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		role: {type: String, default: "isVendor"},
		images: {type: Array, default: []},
		address: {
			type: {
				city: {type: String, required: true},
				street: {type: String, required: true},
			},
		},
		category: {type: String, required: true},
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
	{timestamps: true},
);

const BusinessUsers = mongoose.model("BusinessUsers", businessUserSchema);

module.exports = BusinessUsers;
