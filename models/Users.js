const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			first: {type: String, required: true},
			last: {type: String, required: true},
		},
		email: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		phone: {type: String},
		address: {
			city: {type: String, required: true},
			street: {type: String, required: true},
		},
		role: {type: String, default: "customer"},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{timestamps: true},
);

const User = mongoose.model("User", userSchema);
module.exports = User;
