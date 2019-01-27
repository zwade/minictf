"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const bl = require("beautiful-log");
const uuid = require("uuid/v4");
const crypto = require("crypto");
const fs = require("mz/fs");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const nconf_1 = require("nconf");
const mongodb_1 = require("mongodb");
bl.init("Postable", "console");
let log = bl.make("index.ts");
let nconf = (new nconf_1.Provider({}))
    .argv()
    .env()
    .defaults({
    "BASENAME": "localhost:1337",
    "PORT": "1337",
});
const port = parseInt(nconf.get("PORT"));
const mongoUser = nconf.get("MONGO_USER");
const mongoPass = nconf.get("MONGO_PASS");
const domain = "localhost";
const mongoURI = mongoUser
    ? `mongodb://${mongoUser}:${mongoPass}@${domain}:27017/postable`
    : `mongodb://${domain}:27017/postable`;
const defaultCsp = `default-src  'none';` +
    `script-src   'self';` +
    `frame-src    'self';` +
    `style-src    'self' https://fonts.googleapis.com/;` +
    `font-src      https://fonts.gstatic.com/;`;
const secret = "vundervul secuity";
let app = express();
let appendCSP = function (res, policy) {
    if (policy.indexOf("\n") >= 0) {
        throw new Error("Invalid Policy");
    }
    let current = res.get("Content-Security-Policy");
    let options = current ? [current, policy] : [policy];
    res.setHeader("Content-Security-Policy", options);
};
let getDB = () => __awaiter(this, void 0, void 0, function* () {
    try {
        let client = yield mongodb_1.MongoClient.connect(mongoURI);
        let db = client.db("postable");
        log.info("Connected successfully to server");
        return new Proxy({}, {
            get(target, handler) {
                let index = handler.toString();
                if (target[index])
                    return target[index];
                let newDb = db.collection(index);
                target[index] = newDb;
                return newDb;
            }
        });
    }
    catch (e) {
        log.error(e);
    }
});
let main = () => __awaiter(this, void 0, void 0, function* () {
    let db = yield getDB();
    app.use("/", (req, res, next) => {
        res.header("Content-Security-Policy", defaultCsp);
        next();
    });
    app.use("/static/", express.static(path.join(__dirname, "client")));
    app.use(express.urlencoded());
    app.use(cookieParser());
    app.get("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!req.cookies)
            return res.redirect("/login");
        let token = req.cookies["auth"];
        if (!token)
            return res.redirect(`/login`);
        let { user } = yield db.tokens.findOne({ token });
        if (!user)
            return res.redirect(`/login`);
        let posts = yield db.posts.aggregate([
            { $match: { user } },
            { $sort: { date: -1 } },
        ]).toArray();
        let embedder = ({ content, date, _id }) => {
            let permalink = `http://${nconf.get("BASENAME")}/permalink?post=${_id}`;
            return `
<div class="post">
	<div class="post-header">
		<div class="time">${moment(date).format("MMM Do")} at ${moment(date).format("h:mm A")}</div>
		<div class="share inline-button" url="${permalink}">permalink</div>
		<form method="POST" action="/report" class="report-form">
			<input type="hidden" name="uri" value="${permalink}"/>
			<input type="submit" class="inline-button" value="report"/>
		</form>
	</div>
	<div class="content">${content}</div>
</div>
`;
        };
        let embed = posts.map(embedder).join("\n");
        let indexBuff = yield fs.readFile(path.join(__dirname, "client", "index.html"));
        let indexFile = indexBuff.toString().replace(/\{posts\}/g, embed);
        res.send(indexFile);
    }));
    app.get("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.sendFile(path.join(__dirname, "client", "login.html"));
    }));
    app.get("/register", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.redirect("/login");
    }));
    app.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { username, password } = req.body;
        if (!(typeof username === "string"
            && typeof password === "string")) {
            res.status(500);
            res.send("Error");
            return;
        }
        const hash = crypto.createHash("sha256");
        hash.update(password);
        let hashedPass = hash.digest("hex");
        let existing = yield db.users.find({
            username,
            hashedPass
        }).toArray();
        if (existing.length !== 1) {
            res.status(500);
            res.send("Error");
            return;
        }
        let [{ _id }] = existing;
        let token = uuid();
        yield db.tokens.insert({
            user: _id,
            token
        });
        res.cookie("auth", token, { httpOnly: true });
        res.redirect("/");
    }));
    app.post("/register", (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { username, password, password_verify, } = req.body;
        if (!(typeof username === "string"
            && typeof password === "string"
            && typeof password_verify === "string"
            && password_verify === password)) {
            res.status(500);
            res.send(`${typeof username}, ${typeof password}, ${typeof password_verify}, ${password_verify === password}`);
            return;
        }
        const hash = crypto.createHash("sha256");
        hash.update(password);
        let hashedPass = hash.digest("hex");
        let result = yield db.users.insert({
            username,
            hashedPass
        });
        // Version mismatch between the types and the actual library
        // (not relevant to CTF)
        let user = result.insertedIds['0'];
        let token = uuid();
        yield db.tokens.insert({
            user,
            token
        });
        res.cookie("auth", token, { httpOnly: true });
        res.redirect("/");
    }));
    app.post("/new", (req, res) => __awaiter(this, void 0, void 0, function* () {
        let token = req.cookies["auth"];
        if (!token) {
            res.status(500);
            res.send(`Not logged in!`);
        }
        let { user } = yield db.tokens.findOne({ token });
        if (!user) {
            res.status(500);
            res.send(`Invalid user`);
        }
        if (!req.body["content"] || typeof req.body["content"] !== "string") {
            res.status(500);
            res.send(`No content`);
        }
        let { content } = req.body;
        let date = new Date();
        yield db.posts.insert({
            content,
            user,
            date,
        });
        res.redirect("/");
    }));
    app.get("/permalink", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            let { owner, post } = req.query;
            let { content } = yield db.posts.findOne({
                _id: new mongodb_1.ObjectID(post),
            });
            res.send(content);
        }
        catch (e) {
            log.error(e);
            res.status(500);
            res.send("error");
        }
    }));
    /*
        app.get("/source", async (req, res) => {
            let filepath = path.join(__dirname, "..", "src", "index.ts");
            let file = await fs.readFile(filepath);
            let body = prism.highlight(file.toString(), prism.languages.javascript);
            res.send(`
    <html>
        <head>
            <link rel="stylesheet" href="/prismstyle.css">
        </head>
        <body>
            <pre>
    ${body}
            </pre>
        </body>
    </html>
            `);
        });
    
        app.get("/prismstyle.css", (req, res) => {
            let prism = path.dirname(require.resolve("prismjs"));
            let theme = "prism.css";
            let filename = path.join(prism, "themes", theme);
            res.sendFile(filename);
        });
    */
    app.get("/report", (req, res) => {
        res.send(`
<html>
	<body>
		<form method="POST" action="/report">
			Report a URL to the Admin: <input type="text" name="uri" placeholder="http://${nconf.get("BASENAME")}/...">
			<input type="submit" value="Submit">
		</form>
	</body>
</html>
		`);
    });
    app.post("/report", (req, res) => __awaiter(this, void 0, void 0, function* () {
        let { uri } = req.body;
        let ip = req.connection.remoteAddress;
        let time = Date.now();
        let count = yield db.reports.count({ ip, time: { $gt: (time - 1 * 60 * 1000) } });
        if (count >= 4) {
            res.status(500);
            res.send("Calm yourself, please.");
            return;
        }
        yield db.reports.insert({
            ip,
            time,
            basename: nconf.get("BASENAME"),
            uri,
        });
        res.send("Got it! We'll check it out soon.");
    }));
    app.listen(port);
});
process.on("unhandledRejection", (e) => {
    log.error("Failure", e);
    // throw e;
});
main();
//# sourceMappingURL=index.js.map