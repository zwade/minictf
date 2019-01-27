all: csp vfs canihaveflag bagelshop
.PHONY: all csp csp-server csp-bot vfs canihaveflag bagelshop

csp-server:
	echo "Building: csp-server" && \
	docker build -q simple-csp -f simple-csp/Dockerfile.server -t csp-server > /dev/null

csp-bot: csp-server
	echo "Building: csp-bot" && \
	docker build -q simple-csp -f simple-csp/Dockerfile.bot -t csp-bot > /dev/null

csp: csp-server csp-bot

vfs:
	echo "Building: vfs" && \
	docker build -q vfs -t vfs > /dev/null

canihaveflag:
	echo "Building: canihaveflag" && \
	docker build -q canihaveflag -t canihaveflag > /dev/null

bagelshop:
	echo "Building: bagelshop" && \
	docker build -q bagelshop/web -t bagelshop > /dev/null