import hashpumpy
import urllib
import hashlib
import binascii
import base64

text = urllib.unquote(raw_input().strip())
preamble, data, sig = text.split(".")

newsig, newdata = hashpumpy.hashpump(base64.b64decode(sig), base64.b64decode(data), "&isAdmin=true", 0)

result = urllib.quote(base64.b64encode("{}") + "." + base64.b64encode(newdata) + "." + base64.b64encode(newsig))
print(result)