var express = require('express');
var fs = require('fs');
var infile = "index.html";
var app = express.createServer(express.logger());

app.get('/', function(request, response) 
{
    var s = fs.readFileSync(infile, 'utf8');
    response.send( s.toString() ); 
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
