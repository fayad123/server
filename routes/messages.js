const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const auth = require("../middlewares/auth");

// send message
router.post("/", auth, async (req, res) => {
	try {
		const message = new Message({
			fromUser: req.user._id,
			toUserVendor: req.body.toUserVendor,
			message: req.body.message,
		});
		const saved = await message.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({message: err.message});
	}
});

// קבל הודעות שנשלחו למשתמש
router.get("/inbox", auth, async (req, res) => {
	try {
		const messages = await Message.find({toUserVendor: req.user._id}).populate(
			"fromUser",
			"name",
		);
		res.json(messages);
	} catch (err) {
		res.status(500).json({message: err.message});
	}
});

module.exports = router;
