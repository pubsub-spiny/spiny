//var http = require('http2').raw;
var http = require('http');

var count = 1;
setInterval(function() {
	http.get('http://localhost:8000/pub/v1/aaa?v='+'Hello'+count, function(response) {
	  response.pipe(process.stdout);
	  count++;
	});
}, 700);