let puppeteer = require("puppeteer");
let url       = require("url");
let nconf     = require("nconf");
let dbProm    = require("./db")("trackr");

nconf.argv().env();

const host       = nconf.get("BASENAME") || "localhost:7654";
const flag       = nconf.get("FLAG") || "CTF{why_is_it_xss_but_not_xsrf}";
const chrome     = nconf.get("chrome");
const token      = "this_isnt_a_real_token";
const chromeOpts = chrome ? { executablePath: chrome } : {}

let sleep = time => new Promise(resolve => setTimeout(resolve, time));

let visitPage = async (page) => { 
	let resource = url.parse(page);

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


let getEntry = async () => {
	let db = await dbProm;

	let rec = async () => {
		let result = await db.xss.find({}, {$orderby: {date: -1}, $limit: 1 }).toArray();
		if (result.length === 0) {
			console.log("Found nothing in the db");
			await sleep(1000);
			return rec();
		}
		let [{ uid, _id }] = result;
		await db.xss.remove({ _id });
		let uri = `http://${host}/view?report=${uid}`;
		console.log(`Visiting ${uri}`);
		await visitPage(uri);
		return rec();
	}
	return rec();
}

process.on("unhandledRejection", (e) => {
	console.error("Failure", e);
})

getEntry()

