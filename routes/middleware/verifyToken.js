const jwt = require("jsonwebtoken"),
	config = require("../../config");

const verifyToken = (req, res, next) => {
	const token = req.signedCookies["x-access-token"];

	if(!token) return res.status(403).send({ message: "No token provided." });

	jwt.verify(token, config.jwtSecret, (err, decoded) => {
		if(err) return res.status(400).send({ message: "Failed to authenticate token." });

		req.token = decoded;
		next();
	});
}

module.exports = verifyToken;