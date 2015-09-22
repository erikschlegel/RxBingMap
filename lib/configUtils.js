var fs = require('fs');
var defaultConfig = {BingMapsApiKey:"", BingServiceKey:""};
var configFile = './config.json';

var configuration = {
	load: function(){
		this.save(defaultConfig, configFile);

		var newConfig = {};
		Object.keys(defaultConfig).forEach(function(item) {
				if(process.env[item]){
					newConfig[item] = process.env[item];
				}
		});

		this.save(JSON.stringify(newConfig), configFile);
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
