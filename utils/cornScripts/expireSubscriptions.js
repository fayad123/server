require("dotenv").config();
const mongoose = require("mongoose");
const BusinessUser = require("../../models/BusinessUser");

(async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB");

		const now = new Date();
		const expiredUsers = await BusinessUser.find({
			isSubscribed: true,
			expiryDate: {$lte: now},
		});

		console.log("Found", expiredUsers.length, "expired users.");

		for (let user of expiredUsers) {
			user.isSubscribed = false;
			user.planId = "free";
			user.subscriptionDate = null;
			user.expiryDate = null;
			await user.save();
			console.log(`Unsubscribed ${user.email}`);
		}

		console.log("Finished checking subscriptions");
	} catch (error) {
		console.error("Error running script:", error);
	} finally {
		mongoose.disconnect();
	}
})();


// for check - - - node utils/cornScripts/expireSubscriptions.js

// for render - - - 0 3 * * *