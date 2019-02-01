const fs    = require("fs").promises
const path  = require("path");
const crc32 = require("crc-32")

const express      = require("express");
const cookieParser = require("cookie-parser");
const randomString = require("randomstring");
const { Provider } = require("nconf");

const adjectives = ['Fast', 'Furry', 'Round', 'Silly', 'Loud', 'Eclectic', 'Grand', "Annoying", "Rambunctious"];
const animals    = ['Koala', 'Giraffe', 'Dog', 'Cat', 'Squirell', 'Emu', 'Orangutang', 'Meerkat', 'Hacker'];
const colors     = [
	['#f44336', '#FFFFFF'], 
	['#9C27B0', '#FFFFFF'], 
	['#2196F3', '#FFFFFF'], 
	['#00BCD4', '#000000'], 
	['#4CAF50', '#000000'], 
	['#FFEB3B', '#333333'], 
	['#FF5722', '#000000']
];

const nconf = 
	(new Provider())
	.argv()
	.env()
	.defaults({
		flag: "CTF{Nope_you_actually_have_to_solve_the_problem}",
	})

const secret = randomString.generate(8);
const app = express()

let atob = (a) => (Buffer.from(a).toString("base64"));
let btoa = (b) => (Buffer.from(b, "base64").toString());

function getData(req, auth) {
	if (!auth) {
		return;
	}

	let [_preamble, data, signature] = auth.split(".");
	data = btoa(data);
	signatureBuf = Buffer.from(btoa(signature), "hex");
	signature = 
		   signatureBuf[0] 
		| (signatureBuf[1] << 8)
		| (signatureBuf[2] << 16)
		| (signatureBuf[3] << 24);

	let digest = crc32.str(`${secret}${data}`);

	if (digest !== signature) {
		return false;
	}

	let parsedData = 
		data
		.split("&")
		.map((x) => x.split("="))
		.reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

	req.userData = parsedData;

	return true;
}

function generateNewAuthToken(req, res, data) {
	let stringifiedData =
		Object.keys(data)
		.map(key => `${key}=${data[key]}`)
		.join("&");

	let digest = crc32.str(`${secret}${stringifiedData}`);

	let preamble = JSON.stringify({ 
		"alg": "CRC-32 (little endian)", 
		"typ": "UWT",
	})
	let hexdigest = Buffer.from([
		digest         & 0xFF,
		(digest >> 8)  & 0xFF,
		(digest >> 16) & 0xFF,
		(digest >> 24) & 0xFF
	]).toString("hex");

	res.cookie('user-auth', `${atob(preamble)}.${atob(stringifiedData)}.${atob(hexdigest)}`);
	req.userData = data;
}

function getRandomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

app.use(cookieParser())
app.use((req, res, next) => {
	let auth = req.cookies["user-auth"];
	console.log(auth)

	if (!getData(req, auth)) {
		let [color, fontColor] = getRandomElement(colors);
		generateNewAuthToken(req, res, {
			userName: `${getRandomElement(adjectives)} ${getRandomElement(animals)}`,
			isAdmin: "false",
			color,
			fontColor,
		});
	}

	next();
});

app.get("/", async (req, res) => {
	let indexBuffer = await fs.readFile(path.join(__dirname, "index.html"));
	let indexContents = indexBuffer.toString();

	let index = 
		indexContents.replace("{{flag}}", 
			req.userData.isAdmin === "true"
			? `Sure, it's: ${nconf.get("flag")}` 
			: `No, ${req.userData.userName}!`);

	res.send(index);
});

app.listen("5454", "0.0.0.0");
