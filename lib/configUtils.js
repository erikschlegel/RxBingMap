var Config = require('../config.json');
var fs = require('fs');

var configuration = {
	load: function(){
		var newConfig = {};

		if(Config){
			Object.keys(Config).forEach(function(item) {
				if(process.env[item]){
					newConfig[item] = process.env[item];
				}
			});
		}

		this.save(JSON.stringify(newConfig), './config.json');
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