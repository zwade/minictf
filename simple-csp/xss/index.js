let puppeteer = require("puppeteer");
let url       = require("url");
let nconf     = require("nconf");
let dbProm    = require("./db")("postable");

nconf.argv().env();

const host       = nconf.get("BASENAME") || "localhost:1337";
const flag       = nconf.get("FLAG") || "CTF{creative-people-solve-crazy-security-problems}";
const chrome     = nconf.get("chrome");
const token      = "this_isnt_a_real_token";
const chromeOpts = chrome ? { executablePath: chrome } : {}

let sleep = time => new Promise(resolve => setTimeout(resolve, time));

let visitPage = async (page) => { 
	let resource = url.parse(page);

	if (resource.host !== host) {
		console.log({ error: `Will only visit ${host}` });
		return;
	}

	const browser = await puppeteer.launch(chromeOpts);
	const pageElt = await browser.newPage();

	let interrupt = sleep(5000).then(browser.close)

	let allSteps = async () => {
		await pageElt.setCookie({
			name: "auth",
			value: token,
			domain: host,
			httpOnly: true,
		});

		await pageElt.setCookie({
			name: 'flag',
			value: flag,
			domain: host, 
		});

		await pageElt.goto(page);
		await sleep(3000);
		return browser.close();
	}

	return Promise.race([interrupt, allSteps()]);
}

let setup = async (db) => {
	if ((await db.users.count({ username: "admin" })) !== 1) {
		await db.users.remove({});
		await db.users.insert({
			username: "admin",
			hashedPass: "",	
		});
		let { _id } = await db.users.find({ username: "admin" });
		await db.tokens.insert({
			user: _id,
			token,
		});
	}
}

let getEntry = async () => {
	let db = await dbProm;
	await setup(db);

	let rec = async () => {
		let result = await db.reports.find({ $query: {
			basename: host,
		}, $orderby: {date: -1}, $limit: 1 }).toArray();
		if (result.length === 0) {
			await sleep(1000);
			return rec();
		}
		let [{ uri, _id }] = result;
		await db.reports.remove({ _id });
		console.log(`Visiting ${uri}`);
		try {
			await visitPage(uri);
		} catch (e) {
			// pass
		}
		return rec();
	}
	return rec();
}

process.on("unhandledRejection", (e) => {
	console.error("Failure", e);
	process.exit(1);
})

getEntry()

