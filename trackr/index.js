const express     = require("express");
const { fs }      = require("mz");
const path        = require("path");
const nconf       = require("nconf");
const MongoClient = require("mongodb").MongoClient;
const bodyParser  = require("body-parser");
const uuid        = require("uuid/v4");

let database = undefined;
let sleep = (millis) => new Promise(resolve => setTimeout(resolve, millis));
nconf
	.argv()
	.env()
	.defaults({
		"MONGO_HOST": "localhost",
		"MONGO_PORT": "27017"
	})

const mongoHost  = nconf.get("MONGO_HOST");
const mongoPort  = nconf.get("MONGO_PORT");
const mongoUser  = nconf.get("MONGO_USER");
const mongoPass  = nconf.get("MONGO_PASS");

let getDb = (db) => {
	let url = 
		mongoUser
		? `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/admin`
		: `mongodb://${mongoHost}:${mongoPort}/trackr`;
	let tryFn = () => 
		MongoClient.connect(url)
			.then(client => {
				database = client;
				return client;
			}).catch(e => {
				console.log(`Failure: ${e}`);
				return sleep(1000).then(tryFn);
			})
	let promise = database === undefined ? tryFn() : Promise.resolve(database) 
	return promise
		.then(client => client.db(db))
		.then((db) => new Proxy(db, {
				get: (obj, entry) => obj.collection(entry)
			}))
}

async function main () {
	let db = await getDb("trackr");

	let app = express();
	app.use(bodyParser.urlencoded())

	app.get("/", async (req, res) => {
		let file = await fs.readFile(path.join(__dirname, "client", "index.html"));
		res.send(file.toString());
	});

	app.post("/report", async (req, res) => {
		let { title, body } = req.body;
		body = body.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		let uid = uuid();

		await db.reports.insert({
			uid,
			title,
			body,
		});

		await db.xss.insert({
			uid,
			date: new Date(),
		})

		res.redirect(`/view?report=${uid}`);
	});

	app.get("/view", async (req, res) => {
		let { report: uid } = req.query;

		let { title, body } = await db.reports.findOne({ uid });
		let file = await fs.readFile(path.join(__dirname, "client", "report.html"));
		file = file.toString();
		file = file.replace(/{{title}}/g, title).replace(/{{body}}/g, body);

		res.send(file);
	});

	app.listen(7654, "0.0.0.0");
}

main();
