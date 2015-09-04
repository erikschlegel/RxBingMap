var BingServices = require('rx-bing-services');

export function mySurroundings(location, responseCB){
	if(!process.env.BingMapsApiKey)
		throw Error("BingMapsApiKey is not defined error");
	
	var rsp = BingServices.whatsAroundMe({
 		 apiKey: process.env.BingMapsApiKey,
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

export {fromRspToSpatialEntities, getEntityTypeDetails} from 'rx-bing-services';