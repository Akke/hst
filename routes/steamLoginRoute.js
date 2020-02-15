const mongoose = require("mongoose"),
    User = mongoose.model("users"),
    url = require("url"),
    jwt = require("jsonwebtoken"),
    config = require("../config"),
    verifyToken = require("./middleware/verifyToken"),
    rateLimit = require("express-rate-limit");

const authRateLimits = {
    login: rateLimit({
        windowMs: 10000,
        max: 5
    }),
    logout: rateLimit({
        windowMs: 1000,
        max: 10
    }),
    verify: rateLimit({
        windowMs: 1000,
        max: 5
    }),
    fetch: rateLimit({
        windowMs: 1000,
        max: 3
    })
};

module.exports = (app, steam) => {
    app.get("/api/user/login", [authRateLimits.login, steam.authenticate()], function(req, res) {
        res.status(200);
    });
     
    app.get("/api/user/login/verify", [authRateLimits.verify, steam.verify()], function(req, res) {
        const steamId = req.user._json.steamid;

        const findUser = User.find({ steamId: steamId }, (err, user) => {
            const options = {
                httpOnly: true,
                signed: true,
                maxAge: 86400000 // ms 24h
            };

            if(user.length < 1) {
                const newUser = new User({
                    steamId: req.user._json.steamid,
                    username: req.user._json.personaname,
                    avatar: req.user._json.avatarfull,
                    createdAt: new Date(),
                    accountId: null
                });

                newUser.save((err, user) => {
                    if(err) return res.status(400).send(err).end();

                    const token = jwt.sign({ id: user._id, username: user.username, avatar: user.avatar }, config.jwtSecret, {
                        expiresIn: 86400 // expires in 24 hours
                    });

                    res.cookie("x-access-token", token, options);
                    res.redirect(`${process.env.REACT_URL}/login/verify`);
                });
            } else {
                const token = jwt.sign({ id: user[0]._id, username: user[0].username, avatar: user[0].avatar }, config.jwtSecret, {
                    expiresIn: 86400
                });
                
                res.cookie("x-access-token", token, options);
                res.redirect(`${process.env.REACT_URL}/login/verify`);
            }
        });
    });

    app.get("/api/auth/logout", [authRateLimits.logout, steam.enforceLogin("/")], function(req, res) {
        req.logout();
        res.status(200);
    });

    app.get("/api/auth/fetch", [authRateLimits.fetch, verifyToken], function(req, res) {
        res.send({ token: req.token });
    });

    app.get("/api/auth/end", [authRateLimits.logout], function(req, res) {
        res.clearCookie("x-access-token").end();
    });
}