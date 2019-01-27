all: csp vfs canihaveflag

csp-server:
	docker build simple-csp -f simple-csp/Dockerfile.server -t csp-server

csp-bot: csp-server
	docker build simple-csp -f simple-csp/Dockerfile.bot -t csp-bot

csp: csp-server csp-bot

vfs:
	docker build vfs -t vfs

canihaveflag:
	docker build canihaveflag -t canihaveflag