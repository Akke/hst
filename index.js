const dotenv = require("dotenv").config(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    http = require("http"),
    express = require("express"),
    cookieParser = require("cookie-parser"),
    csrf = require("csurf"),
    i18n = require("i18n");

require("./models/Ability");
require("./models/Equipment");
require("./models/EquipmentType");
require("./models/Offer");
require("./models/User");
require("./models/ChatRoom");
require("./models/ChatRoomMessage");
require("./models/Socketable");
require("./models/SocketableType");

const app = express(),
    steam = require("steam-login"),
    session = require("express-session"),
    server = http.createServer(app),
    io = require("socket.io")(server),
    csrfProtection = csrf({ cookie: true }),
    jsonParser = bodyParser.json(),
    port = process.env.PORT;

app.use(require("express-session")({ resave: false, saveUninitialized: false, secret: process.env.EXPRESS_SESSION_SECRET }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(i18n.init);

app.use("/api", (req, res, next) => {
    next();
});

app.use(steam.middleware({
    realm: `${process.env.BASE_URL}:${process.env.PORT}`, 
    verify: `${process.env.BASE_URL}:${process.env.PORT}/api/user/login/verify`,
    apiKey: process.env.STEAM_API_KEY
}));

/*mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});*/

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

require("./routes/csrfRoute")(app, csrfProtection);
require("./routes/offerRoute")(app, csrfProtection, jsonParser, io);
require("./routes/equipmentRoute")(app, csrfProtection, jsonParser);
require("./routes/abilityRoute")(app, csrfProtection, jsonParser);
require("./routes/steamLoginRoute")(app, steam);
require("./routes/chatRoomRoute")(app, csrfProtection, jsonParser, io);
require("./routes/userRoute")(app, csrfProtection, jsonParser);
require("./routes/steamRoute")(app, csrfProtection, jsonParser);
require("./routes/socketableRoute")(app, csrfProtection, jsonParser);

if(process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    const path = require("path");
    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
    })
}

server.listen(port, () => {
    console.log(`App running at port ${port}`);
});