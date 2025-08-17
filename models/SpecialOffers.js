const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
	url: {
		type: String,
		default: "",
		// validate: {
		// 	validator: function (v) {
		// 		// Only validate if URL is provided
		// 		return (
		// 			v === "" ||
		// 			/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)
		// 		);
		// 	},
		// 	message: (props) => `${props.value} is not a valid URL!`,
		// },
	},
	alt: {
		type: String,
		default: "",
		maxlength: [100, "Alt text cannot be longer than 100 characters"],
	},
});

const serviceSchema = new mongoose.Schema({
	featureName: {
		type: String,
		required: [true, "Feature name is required"],
		trim: true,
		maxlength: [150, "Feature name cannot be longer than 100 characters"],
	},
	price: {
		type: Number,
		required: [true, "Price is required"],
		min: [0, "Price must be at least 0"],
	},
});

const specialOffersSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [100, "Title cannot be longer than 100 characters"],
		},
		images: [imageSchema],
		services: {
			type: [serviceSchema],
			validate: {
				validator: function (v) {
					return v.length > 0;
				},
				message: "At least one service is required",
			},
		},
		vendorId: {
			type: String,
		},
		businessName: {
			type: String,
			trim: true,
			maxlength: [100, "Business name cannot be longer than 100 characters"],
		},
		category: {type: String},
		note: {
			type: String,
			default: "",
			trim: true,
			maxlength: [500, "Note cannot be longer than 500 characters"],
		},
	},
	{
		timestamps: true
	},
);

// compound index for frequently queried fields
specialOffersSchema.index({vendorId: 1, createdAt: -1});

const SpecialOffers = mongoose.model("SpecialOffers", specialOffersSchema);

module.exports = SpecialOffers;
