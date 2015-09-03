var BingServices = require('rx-bing-services');

const APIKey = 'Aji7ARlyYm81OWlGyWxr8DCdPFhUtbYyAYq1LcAKgFoYh1Q6Dx5Sqvybk8qVTtir';

export function mySurroundings(location, responseCB){
	var rsp = BingServices.whatsAroundMe({
 		 apiKey: APIKey,
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