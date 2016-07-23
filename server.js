var express = require('express');
var app = express();

app.use(express.static('./'));

app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(__dirname + '/index.html');
});

var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Starting server at http://%s:%s', host, port);
});
