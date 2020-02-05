const mongoose = require("mongoose"),
	User = mongoose.model("users"),
	verifyToken = require("./middleware/verifyToken");

module.exports = (app, csrfProtection, jsonParser) => {
    app.get("/api/user", [jsonParser, csrfProtection, verifyToken], async(req, res) => {
        let user = await User.find({ _id: mongoose.Types.ObjectId(req.query.id) }, { username: 1, steamId: 1, avatar: 1 });
        
        return res.status(200).send(user);
    });
}