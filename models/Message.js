const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
	fromUser: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
	toUserVendor: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
	message: {type: String, required: true},
	sentAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model("Messages", messageSchema);
