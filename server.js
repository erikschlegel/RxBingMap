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
    var time = new Date(), formattedDate, formattedTime, wholeThing;
    formattedDate = daysOfWeek[time.getDay()] + ", " + monthsOfYear[time.getMonth()] + " " + time.getDate() + ", " + time.getFullYear();
    formattedTime = time.getHours() + ":" + time.getMinutes().padLeft("0", 2) + time.getSeconds().padLeft("0", 2);

    return formattedTime + ": ";
};

if(!process.env.configLoaded){
	configUtils.load();
  var execFile = require('child_process').exec;
  var cmd = "\"./node_modules/.bin/grunt\" browserify:example";
  execFile(cmd, function(error, stdout, stderr) {
      configUtils.save(timeFormatter() + stdout, './logsOut.txt');
      configUtils.save(timeFormatter() + stderr, './logsErr.txt');
    if (error != null) {
        configUtils.save('exec error: ' + timeFormatter() + error, './Error.txt');
    }
    process.env.configLoaded = true;
  });
}
