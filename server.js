var PORT = normalizePort(process.env.port || '5000');
var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

require('./models/Posts');
require('./models/Comments');
require('./models/Users');
require('./config/passport');
mongoose.connect('mongodb://localhost/posts');

var routes = require('./routes/index');

var app = express();

app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use(passport.initialize());

app.use('/', routes);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var server = http.createServer(app);
server.listen(PORT);

server.on('error', function (error) {
  if (error.syscall !== 'listen')
    throw error;

  switch (error.code) {
  case 'EACCES':
    console.error(PORT + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(PORT + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
    break;
  }
});

server.on('listening', function () {
  var addr = server.address().address;
  var port = server.address().port;
  console.log('Listening on %s:%s', addr, port);
});

function normalizePort(port) {
  var ret = parseInt(port, 10);

  if (isNaN(ret)) 
    return port;

  if (ret >= 0) 
    return ret;

  return false;
}
