var fs = require('fs');
var configFile = './config.json';

var configuration = {
  load: function () {
      var defaultConfig = {};
	    var properties = ['BingMapsApiKey', 'BingServiceKey'];
		  var logStr = '';

			properties.forEach(function (item) {
			    if (process.env[item]) {
			            logStr = logStr + item + ':' + process.env[item] + '\n';
					    defaultConfig[item] = process.env[item];
					}
			});
			var jsonTstring = JSON.stringify(defaultConfig);
			this.save(jsonTstring, configFile);
	},
	save: function(config, file){
		console.log(JSON.stringify(config));
		fs.writeFile(file, config, function (err) {
		        if (err) {
		            return console.log('Err: ' + err);
		        }

		        console.log("The config file was saved to !" + file);
		});
	}
};

module.exports = configuration;
