import * as express from "express";
import * as path from "path";
import * as bl from "beautiful-log";
import * as uuid from "uuid/v4";
import * as crypto from "crypto";
import * as fs from "mz/fs";
import * as cookieParser from "cookie-parser";
import * as moment from "moment";
import * as prism from "prismjs";

import { Provider } from "nconf";
import { URL } from "url";
import { MongoClient, Collection, ObjectID } from "mongodb";

bl.init("Postable", "console");
let log = bl.make("index.ts")
let nconf =
	(new Provider({}))
	.argv()
	.env()
	.defaults({
		"BASENAME": "localhost:1337",
		"PORT": "1337",
		"MONGO_HOST": "localhost",
		"MONGO_PORT": "27017",
	})

const port = parseInt(nconf.get("PORT"))

const mongoUser = nconf.get("MONGO_USER");
const mongoPass = nconf.get("MONGO_PASS");
const mongoHost = nconf.get("MONGO_HOST");
const mongoPort = nconf.get("MONGO_PORT");
const mongoURI = 
	mongoUser
	? `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/admin`
	: `mongodb://${mongoHost}:${mongoPort}/postable`;

const defaultCsp =
	`script-src   'self';`                               +
	`frame-src    'self';`                               +
	`style-src    'self' https://fonts.googleapis.com/;` +
	`font-src      https://fonts.gstatic.com/;`          ;

let app = express();

let getDB = async () => {
	try {
		let client = await MongoClient.connect(mongoURI);
		let db = client.db("postable");

  		log.info("Connected successfully to server");
 		return new Proxy<{ [key: string]: Collection<any> }>({}, {
 			get(target, handler) {
 				let index = handler.toString();
 				if (target[index]) return target[index];
 				let newDb = db.collection(index);
 				target[index] = newDb;
 				return newDb;
 			}
 		});
 	} catch (e) {
 		log.error(e);
 		process.exit(1);
 	}
}

let main = async() => {
	let db = await getDB();

	app.use("/", (req, res, next) => {
		res.header("Content-Security-Policy", defaultCsp);
		next();
	});

	app.use("/static/", express.static(path.join(__dirname, "client")));

	app.use(express.urlencoded());
	app.use(cookieParser());

	app.get("/", async (req, res) => {
		if (!req.cookies) return res.redirect("/login");

		let token = req.cookies["auth"];
		if (!token) return res.redirect(`/login`);

		let tokenObj = await db.tokens.findOne({ token });
		if (!tokenObj) return res.redirect(`/login`);
		let user = tokenObj.user;

		let posts = await db.posts.aggregate([
			{ $match: { user } },
			{ $sort: { date: -1 } },
		]).toArray();

		let embedder = ({ content, date, _id }: { content: string, date: Date, _id: ObjectID }) => {
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
		}
		let embed = posts.map(embedder).join("\n");

		let indexBuff = await fs.readFile(path.join(__dirname, "client", "index.html"));
		let indexFile = indexBuff.toString().replace(/\{posts\}/g, embed);

		res.send(indexFile);
	});

	app.get("/login", async (req, res) => {
		res.sendFile(path.join(__dirname, "client", "login.html"));
	});

	app.get("/register", async (req, res) => {
		res.redirect("/login");
	});

	app.post("/login", async (req, res) => {
		let { 
			username,
			password 
		} : {
			username: any,
			password: any
		} = req.body;

		if (! (typeof username === "string" 
			&& typeof password === "string")) {
			res.status(500);
			res.send("Error");
			return;
		}

		const hash = crypto.createHash("sha256");
		hash.update(password);
		let hashedPass = hash.digest("hex");

		let existing = await db.users.find({
			username,
			hashedPass
		}).toArray();

		if (existing.length !== 1) {
			res.status(500);
			res.send("Error");
			return;
		}

		let [ { _id } ] = existing;

		let token = uuid();

		await db.tokens.insert({
			user: _id,
			token
		});

		res.cookie("auth", token, { httpOnly: true });
		res.redirect("/");
	});

	app.post("/register", async (req, res) => {
		let { 
			username,
			password,
			password_verify,
		} : { [key: string]: any } = req.body;

		if (! (typeof username === "string" 
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

		let result = await db.users.insert({
			username,
			hashedPass
		});

		// Version mismatch between the types and the actual library
		// (not relevant to CTF)
		let user = (result as any).insertedIds['0'];

		let token = uuid();

		await db.tokens.insert({
			user,
			token
		});

		res.cookie("auth", token, { httpOnly: true });
		res.redirect("/");
	});

	app.post("/new", async (req, res) => {
		let token = req.cookies["auth"];
		if (!token) {
			res.status(500);
			res.send(`Not logged in!`);
		}

		let tokenObj = await db.tokens.findOne({ token });
		if (!tokenObj) {
			res.status(500);
			res.send(`Invalid user`);
		}

		let user = tokenObj.user;

		if (!req.body["content"] || typeof req.body["content"] !== "string") {
			res.status(500);
			res.send(`No content`);
		}

		let { content } = req.body;
		let date = new Date();
		await db.posts.insert({
			content,
			user,
			date,
		});
		res.redirect("/");
	});

	app.get("/permalink", async (req, res) => {
		try {
			let { owner, post } = req.query;
			let { content } = await db.posts.findOne({
				_id: new ObjectID(post),
			});
			res.send(content);
		} catch(e) {
			log.error(e);
			res.status(500);
			res.send("error");
		}
	});

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

	app.post("/report", async (req, res) => {
		let { uri } = req.body;
		let ip = req.connection.remoteAddress;
		let time = Date.now();
		let count = await db.reports.count({ ip, time: { $gt: (time - 1 * 60 * 1000) } })
		if (count >= 4) {
			res.status(500);
			res.send("Calm yourself, please.");
			return;
		}

		await db.reports.insert({
			ip,
			time,
			basename: nconf.get("BASENAME"),
			uri,
		});

		res.send("Got it! We'll check it out soon.");
	})

	app.listen(port);
}

process.on("unhandledRejection", (e) => {
	log.error("Failure", e);
})

main();