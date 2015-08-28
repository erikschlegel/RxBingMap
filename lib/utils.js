var vm = require("vm"); 
var http = require("http"); 

module.exports = {
	include : function(path){
	    var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", path);
        document.body.appendChild(script);

	    return script;
	}
};