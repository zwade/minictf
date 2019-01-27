let nconf       = require("nconf");
let MongoClient = require("mongodb").MongoClient;

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
		: `mongodb://${mongoHost}:${mongoPort}/postable`;
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

module.exports = getDb;
