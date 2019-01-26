from pygments import highlight as phighlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

def highlight(code):
	highlighted_code = phighlight(code, PythonLexer(), HtmlFormatter())
	return """
<html>
	<head>
		<link rel="stylesheet" href="/assets/css/theme.css">
	</head>
	<body>
		{highlighted_code}
	</body>
</html>
	""".format(highlighted_code=highlighted_code)