var BingServices = require('rx-bing-services');
import Config from '../config.json'

export function mySurroundings(location, responseCB){
	if(!Config.BingServiceKey)
		throw Error("BingServiceKey is not defined error");

	var rsp = BingServices.whatsAroundMe({
 		 apiKey: Config.BingServiceKey,
  	 location: "{0},{1}".format(location.latitude, location.longitude),
  	 top: 30,
	 	 radius: 1
	} , {
  // Request validation error occured
	  error: function (e){
	    console.log('Received a validation error:\n', e);
	  }
	}).subscribe(responseCB,
        (error) => {
            console.log("There was an error with the bing service call: " + error);
    });
}

export function whereAmI(location, responseCB){
	if(!Config.BingServiceKey)
		throw Error("BingServiceKey is not defined error");

		var rsp = BingServices.whereAmI({
	 		 apiKey: Config.BingServiceKey,
	  	 location: "{0},{1}".format(location.latitude, location.longitude)
		} , {
	  // Request validation error occured
		  error: function (e){
		    console.log('Received a validation error:\n', e);
		  }
		}).subscribe(responseCB,
	        (error) => {
	            console.log("There was an error with the bing service call: " + error);
	    });
}

export {fromResponseToSpatialEntities, getEntityTypeDetails, fromResponeToLocationResources} from 'rx-bing-services';
