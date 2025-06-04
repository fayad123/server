const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
	{
		from: {type: String},
		to: {type: String},
		closed: {type: Boolean, default: false},
	},
	{_id: false},
);

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

		// الحقول الجديدة المتعلقة بالحجوزات
		maxBookingsPerDay: {type: Number, default: 1},
		allowOverlappingBookings: {type: Boolean, default: false},
		bookingDurationInHours: {type: Number, default: 2},
		bookingType: {
			type: String,
			enum: ["daily", "hourly", "multi-booking"],
			default: "daily",
		},
		workingHours: {
			sunday: {
				type: workingHoursSchema,
				default: {from: "09:00", to: "17:00", closed: false},
			},
			monday: {
				type: workingHoursSchema,
				default: {from: "09:00", to: "17:00", closed: false},
			},
			tuesday: {
				type: workingHoursSchema,
				default: {from: "09:00", to: "17:00", closed: false},
			},
			wednesday: {
				type: workingHoursSchema,
				default: {from: "09:00", to: "17:00", closed: false},
			},
			thursday: {
				type: workingHoursSchema,
				default: {from: "09:00", to: "17:00", closed: false},
			},
			friday: {
				type: workingHoursSchema,
				default: {from: "10:00", to: "14:00", closed: false},
			},
			saturday: {type: workingHoursSchema, default: {closed: true}},
		},
	},
	{timestamps: true},
);

const BusinessUsers = mongoose.model("BusinessUsers", businessUserSchema);

module.exports = BusinessUsers;
