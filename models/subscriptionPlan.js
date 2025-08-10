const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
	{
		text: {type: String, required: true},
		included: {type: Boolean, default: false},
		tooltip: {type: String},
	},
	{_id: false},
);

const subscriptionSchema = new mongoose.Schema(
	{
		id: {type: String, required: true, unique: true},
		name: {type: String, required: true},
		price: {type: String, required: true},
		description: {type: String},
		features: [featureSchema],
		recommended: {type: Boolean, default: false},
	},
	{timestamps: true},
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionSchema);
