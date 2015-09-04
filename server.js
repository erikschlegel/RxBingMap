var http = require('http');
var express = require('express');
var port = 1337;

process.on('uncaughtException', function(err) {
  console.log(err);
});

var server = express();

server.use(express.static(__dirname));

server.listen(port, function() { 
    console.log('listening on port ' + port);     
    //var err = new Error('This error won't break the application...')
    //throw err
});