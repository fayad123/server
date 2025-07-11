const mongoose = require("mongoose");
const dayScheduleSchema = require("./dayScheduleSchema");

const workingHoursSchema = new mongoose.Schema(
	{
		sunday: {
			type: dayScheduleSchema,
			default: {from: "09:00", to: "17:00", closed: false},
		},
		monday: {
			type: dayScheduleSchema,
			default: {from: "09:00", to: "17:00", closed: false},
		},
		tuesday: {
			type: dayScheduleSchema,
			default: {from: "09:00", to: "17:00", closed: false},
		},
		wednesday: {
			type: dayScheduleSchema,
			default: {from: "09:00", to: "17:00", closed: false},
		},
		thursday: {
			type: dayScheduleSchema,
			default: {from: "09:00", to: "17:00", closed: false},
		},
		friday: {
			type: dayScheduleSchema,
			default: {from: "10:00", to: "14:00", closed: false},
		},
		saturday: {type: dayScheduleSchema, default: {closed: true}},
	},
	{_id: false},
);

module.exports = workingHoursSchema;
