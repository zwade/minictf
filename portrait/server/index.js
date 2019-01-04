let express = require("express");
let path = require("path");

let app = express()

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.post("/", (req, res) => {
	let body = req.body;
	console.log(body);
	req.send("Thx"); 
});

app.listen(2020, "0.0.0.0");
