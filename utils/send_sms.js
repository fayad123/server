// utils/smsSenderAfterNewBooking.js
const twilio = require("twilio");
require("dotenv").config();

// קח את הנתונים מקובץ .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

const client = twilio(accountSid, authToken);

async function sendSms(to, message) {
	try {
		if (!to || !message) {
			throw new Error("Phone number and message are required");
		}

		const sms = await client.messages.create({
			body: message,
			to, // מספר היעד
			messagingServiceSid,
		});

		console.log("✅ SMS sent successfully:", sms.sid);
		return sms.sid;
	} catch (error) {
		console.error("❌ Error sending SMS:", error.message);
		return null;
	}
}

module.exports = sendSms;
