var http = require('http');
var express = require('express');
var server = express();

server.use(express.static(__dirname));

var port = process.env.PORT || 1337;
server.listen(port, function() { 
    console.log('listening on port ' + port);     
    //var err = new Error('This error won't break the application...')
    //throw err
});