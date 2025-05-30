const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization");
		if (!token) return res.status(403).json({message: "Missing token"});

		req.payload = jwt.verify(token, process.env.JWT_SECRET);
		next();
	} catch (err) {
		res.status(401).json({message: "Invalid token"});
	}
};

module.exports = auth;
