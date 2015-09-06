var BingServices = require('rx-bing-services');
import Config from '../config.json'

export function mySurroundings(location, responseCB){
	if(!Config.BingSpatialDataServiceKey)
		throw Error("BingMapsApiKey is not defined error");

	var rsp = BingServices.whatsAroundMe({
 		 apiKey: Config.BingSpatialDataServiceKey,
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