const mongoose = require("mongoose");
const subscriptionSchema = require("./schemas/subscriptionSchema");
const bookingSettingsSchema = require("./schemas/bookingSettingsSchema");
const workingHoursSchema = require("./schemas/workingHoursSchema");

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
		profileImage: {
			url: {type: String, default: ""},
			public_id: {type: String, default: ""},
		},
		// Subscription
		subscriptionData: {type: subscriptionSchema, default: () => ({})},

		// Booking settings
		bookingSettings: {type: bookingSettingsSchema, default: () => ({})},

		// working days and hours
		workingHours: {type: workingHoursSchema, default: () => ({})},
	},
	{timestamps: true},
);
const businessUser = mongoose.model("BusinessUsers", businessUserSchema);

module.exports = businessUser;
