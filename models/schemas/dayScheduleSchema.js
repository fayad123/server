const mongoose = require("mongoose");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayScheduleSchema = new mongoose.Schema(
	{
		from: {type: String, match: timeRegex},
		to: {type: String, match: timeRegex},
		closed: {type: Boolean, default: false},
	},
	{_id: false},
);

module.exports = dayScheduleSchema;
