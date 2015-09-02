var http = require('http');
var express = require('express');

process.on('uncaughtException', function(err) {
  console.log(err);
});

var server = express();

server.use(express.static(__dirname));

var port = 10001;
server.listen(port, function() { 
    console.log('listening on port ' + port);     
    //var err = new Error('This error won't break the application...')
    //throw err
});