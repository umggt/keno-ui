var express = require('express');
var app = express();

/*
app.get('/', function (req, res) {
  res.send('Hello World!');
});
*/

app.use('/node_modules', express.static(__dirname + '/../node_modules'));

app.use(express.static(__dirname));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});