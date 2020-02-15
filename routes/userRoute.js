const mongoose = require("mongoose"),
    User = mongoose.model("users"),
    verifyToken = require("./middleware/verifyToken"),
    rateLimit = require("express-rate-limit");

const userRateLimits = {
    get: rateLimit({
        windowMs: 1000,
        max: 100
    })
};

module.exports = (app, csrfProtection, jsonParser) => {
    app.get("/api/user", [userRateLimits.get, jsonParser, csrfProtection], async(req, res) => {
        if(req.query.id.length != 24) return res.status(400).send({ message: "User ID is not of valid length." });

        let user = await User.find({ _id: mongoose.Types.ObjectId(req.query.id) }, { username: 1, steamId: 1, avatar: 1, accountId: 1, createdAt: 1 });
        
        return res.status(200).send(user);
    });
}