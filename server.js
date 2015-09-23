var http = require('http');
var express = require('express');
var server = express();
var configUtils = require('./lib/configUtils');

server.use(express.static(__dirname));

var port = process.env.PORT || 1337;
server.listen(port, function() {
    console.log('listening on port ' + port);
    //var err = new Error('This error won't break the application...')
    //throw err
});

var timeFormatter = function () {
    return new Date().toString() + ": ";
};

if(!process.env.configLoaded){
	configUtils.load();
  var execFile = require('child_process').exec;
  var cmd = "\"./node_modules/.bin/grunt\" browserify:example";
  execFile(cmd, function(error, stdout, stderr) {
      configUtils.save(timeFormatter() + stdout, './info.log');
      configUtils.save(timeFormatter() + stderr, './error.log');
    if (error != null) {
        configUtils.save('exec error: ' + timeFormatter() + error, './error.log');
    }
    process.env.configLoaded = true;
  });
}
