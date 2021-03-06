all: csp trackr vfs canihaveflag bagelshop intro js-safe
.PHONY: all csp csp-server csp-bot trackr trackr-server trackr-bot vfs canihaveflag bagelshop js-safe intro

csp-server:
	echo "Building: csp-server" && \
	docker build -q simple-csp -f simple-csp/Dockerfile.server -t csp-server > /dev/null

csp-bot: csp-server
	echo "Building: csp-bot" && \
	docker build -q simple-csp -f simple-csp/Dockerfile.bot -t csp-bot > /dev/null

csp: csp-server csp-bot

trackr-server:
	echo "Building: trackr" && \
	docker build -q trackr -f trackr/Dockerfile.server -t trackr-server > /dev/null

trackr-bot: trackr-server
	echo "Building: trackr-bot" && \
	docker build -q trackr -f trackr/Dockerfile.bot -t trackr-bot > /dev/null

trackr: trackr-server trackr-bot

vfs:
	echo "Building: vfs" && \
	docker build -q vfs -t vfs > /dev/null

canihaveflag:
	echo "Building: canihaveflag" && \
	docker build -q canihaveflag -t canihaveflag > /dev/null

bagelshop:
	echo "Building: bagelshop" && \
	docker build -q bagelshop/web -t bagelshop > /dev/null

js-safe:
	echo "Building: js-safe" && \
	docker build -q js-safe -t js-safe > /dev/null

intro:
	echo "Building: intro" && \
	docker build -q intro -t intro > /dev/null