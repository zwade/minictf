CREATE TABLE USERS (
	name varchar,
	password varchar,
	is_admin boolean
);


INSERT INTO USERS VALUES ('Joe', 'password', false);
INSERT INTO USERS VALUES ('Carolina', '123123', false);
INSERT INTO USERS VALUES ('Zach', 'zachpwn', false);
INSERT INTO USERS VALUES ('Admin', 'abc123123123', true);