const http = require("http"),
    rateLimit = require("express-rate-limit"),
    querystring = require("querystring"),
    redis = require("redis"),
    redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

const steamRateLimits = {
    getPlayerSummaries: rateLimit({
        windowMs: 1000,
        max: 20
    })
};

const CURRENT_UNIX_TIME = Math.floor(new Date() / 1000);
const REDIS_EXPIRE_LIMIT = 900; // seconds, 15 minutes

module.exports = (app, csrfProtection, jsonParser) => {
    app.get("/api/steam/getPlayerSummaries", [steamRateLimits.getPlayerSummaries, jsonParser, csrfProtection], async(req, res) => {
        redisClient.hmget("steam_user", req.query.steamids, (err, reply) => {
            if(err) return res.status(500).send({ message: `Could not read from Redis with error ${err}`});

            redisClient.hmget(`steam_user_expires_${req.query.steamids}`, "expires", (err, expire) => {
                if(err) return res.status(500).send({ message: `Could not read from Redis with error ${err}`});

                if(reply[0] && (CURRENT_UNIX_TIME - expire < REDIS_EXPIRE_LIMIT)) return res.status(200).send(JSON.parse(reply));

                const queryParams = querystring.stringify({
                    key: process.env.STEAM_API_KEY,
                    steamids: req.query.steamids
                }),
                options = {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                };

                http.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?${queryParams}`, options, response => {
                    const { statusCode } = response;

                    if(statusCode != 200) {
                        response.resume();
                        return res.status(statusCode).send({ message: `Could not fetch Steam API getPlayerSummaries with status code ${statusCode}`});
                    }

                    response.setEncoding("utf8");
                    let rawData = "";

                    response.on("data", chunk => rawData += chunk);
                    response.on("end", _ => {
                        try {
                            const parsedData = JSON.parse(rawData);

                            redisClient.hmset(["steam_user", req.query.steamids, rawData]);
                            redisClient.hmset([`steam_user_expires_${req.query.steamids}`, "expires", CURRENT_UNIX_TIME]);

                            return res.status(200).send(parsedData);
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                }).on("error", e => {
                    console.error(`Got error: ${e.message}`);
                    return res.status(500).send(e);
                });
            });
        });
    });
}