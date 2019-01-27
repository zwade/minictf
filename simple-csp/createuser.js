use postable;
db.createUser({ user: "crazy", pwd: "onlycrazypeoplelikecspbypasses", roles: [{ role: "readWrite", db: "postable" }]});
