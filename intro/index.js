const path = require("path");

const express = require("express");
const pg = require("pg");
const { fs } = require("mz");
const qs = require("qs");
const nconf = require("nconf");

const { Client } = require('pg');

const app = express();

nconf.env().argv();
let client = new Client({
	host: "postgres",
	port: 5432,
	user: "admin",
	database: "admin",
	password: nconf.get("postgres_pass"),
});
console.log(nconf.get("postgres_pass"))
client.connect();


app.get("/", async (req, res) => {
	let file = await fs.readFile(path.join(__dirname, "client", "index.html"));
	res.send(file.toString());
});

app.get("/lfi", async (req, res) => {
	let file = await fs.readFile(path.join(__dirname, "client", "lfi.html"));
	res.send(file.toString());
})

app.get("/lfi-example", async (req, res) => {
	try {
		let page = req.query.page;
		let file = await fs.readFile(path.join(__dirname, "client", "lfi", page));
		res.send(file.toString());
	} catch (e) {
		res.send("404 File Not Found");
	}
})

app.get("/type", async (req, res) => {
	let file = await fs.readFile(path.join(__dirname, "client", "type-confusion.html"));
	res.send(file.toString());
});


let password = nconf.get("PASSWORD");
app.get("/type-confusion-test", async (req, res) => {
	let { secret } = req.query;

	if (secret.length != 3) {
		return res.send("Nope! Send me three guesses");
	}

	for (let i = 0; i < 3; i++) {
		if (secret[i] === password) {
			secret.admin = true;
		}
	}

	if (secret.admin) {
		return res.send("Good job, welcome Admin");
	} else {
		return res.send("Wait a minute, you're not the admin!");
	}
});

app.get("/sql", async (req, res) => {
	let file = await fs.readFile(path.join(__dirname, "client", "sql.html"));
	res.send(file.toString());	
})

app.get("/signin", async (req, res) => {
	let query = req.query;
	if (typeof query.name !== "string" || typeof query.password !== "string") {
		return res.send("This is not the type confusion problem!");
	}

	try {
		let result = await client.query(`SELECT is_admin from users where name='${query.name}' and password='${query.password}'`);
		if (result.rows[0].is_admin) {
			res.send("Yay, you're an admin!");
		} else {
			res.send("Nope, not an admin");
		}
	} catch (e) {
		res.send(`Error: ${e} in query SELECT is_admin from users where name='${query.name}' and password='${query.password}'`);
	}
})

app.get("/xss", async (req, res) => {
	let file = await fs.readFile(path.join(__dirname, "client", "xss.html"));
	res.send(file.toString());	
})

app.listen(8000, "0.0.0.0");