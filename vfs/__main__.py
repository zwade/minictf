from flask import Flask, Response
from os import path

from highlight import highlight

import mimetypes
import base64
app = Flask(__name__)

paths = {
	## Main Page
	"home": {
		"type": "file",
		"location": "./assets/index.html",
		"protected": False,
	},

	## Assets
	"assets/js": {
		"type": "dir",
		"path": "./assets/js",
	},
	"assets/css": {
		"type": "dir",
		"path": "./assets/css",
	},
	"assets/birds": {
		"type": "dir",
		"path": './assets/birds',
	},
	"assets/flag.txt": {
		"type": "file",
		"location": "./assets/flag.txt",
		"protected": True,
	},

	## Source Code
	"server/__main__.py": {
		"type": "file",
		"location": "./__main__.py",
		"protected": False,
	},

	## Filters
	"@highlight": {
		"type": "filter",
		"function": highlight,
	},
	"@base64encode": {
		"type": "filter",
		"function": base64.b64encode,
	},
	"@base64decode": {
		"type": "filter",
		"function": base64.b64decode,
	},
}

# Fethes the result based off of the url
def getFile(loc):
	is_first_element = loc[0] != "/"
	if not is_first_element:
		loc = loc[1:]

	# Prevent directory traversal attacks
	loc = path.normpath(loc)
	if ".." in loc:
		raise Exception("Error! Directory traversal detected")

	for prefix in paths:
		if prefix == loc[:len(prefix)]:
			rest = loc[len(prefix):]
			pathData = paths[prefix]

			# If we want a file, return that file's contents
			if pathData["type"] == "file":
				if pathData["protected"]:
					raise Exception("Error! Permission Denied")

				mime, encoding = mimetypes.guess_type(pathData["location"])
				mime = mime if mime is not None else "text/html"

				file = open(pathData["location"], "rb").read()
				return (file, mime)

			# If it's a directory, recursively get our file and then read it
			# from the directory
			if pathData["type"] == "dir":
				remainder, mime = getFile(rest)
				fileLoc = path.join(pathData["path"], remainder)
				try:
					contents = open(fileLoc, "rb").read()
					return (contents, mime)
				except Exception:
					raise Exception("Error! File not found")

			# If we use a filter, make sure its at the beginning of our chain
			# then call it on the recursive result
			if pathData["type"] == "filter":
				if not is_first_element:
					raise Exception("Error! Can only use filters at the beginning of a request")

				file, _mime = getFile(rest)
				response = pathData["function"](file)
				return (response, "text/html")

	# Otherwise, we are a file in a folder, so return the file's name
	mime, encoding = mimetypes.guess_type(loc)
	mime = mime if mime is not None else "text/html"
	return (loc, mime)


@app.route("/")
@app.route("/<path:loc>")
def vfs_router(**kwargs):
	loc = "home" if "loc" not in kwargs else kwargs["loc"]
	try: 
		## Deploy our patent pending VFS router!
		data, mime = getFile(loc)
		return Response(data, mimetype=mime)
	except Exception as e:
		return e.args[0]



app.run(host='0.0.0.0', port=9630)