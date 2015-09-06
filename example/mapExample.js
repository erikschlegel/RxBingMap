import RxBingMap from '../RxBingMap';
import Rx from 'rx';
import Config from '../config.json'

var BingServicesImpl = require('./BingSpatialDataService');

if(!Config.BingMapsApiKey)
  throw Error("BingMapsApiKey is not defined error");

var map = new RxBingMap({MapReferenceId: "mapDiv", 
					  credentials: Config.BingMapsApiKey, 
					  BingTheme: true,
					  CenterMap: true,
					  ShowTraffic: true});

map.registerMapHandlers({click: (result) => {
					  	      if(result.targetType == "map"){
                            map.clearEntities();//Avoid your browser dying slow and painfully
					  	      	      var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);
					  	      	  	  map.pushPins([constructMapPin(loc, '', "Location for {0},{1}".format(loc.latitude, loc.longitude))]);

                          //Call Whats around me to pin your surroundings
                          BingServicesImpl.mySurroundings(loc, (response) => {
                                Rx.Observable.from(BingServicesImpl.fromRspToSpatialEntities(response))
                                             .subscribe((entity) => {
                                                  let entityInfo = BingServicesImpl.getEntityTypeDetails(entity.EntityTypeID);
                                                  map.pushPins([constructMapPin({latitude: entity.Latitude, longitude: entity.Longitude}, 
                                                                                 entityInfo.icon, 
                                                                                 "<b><u>{0}</u></b>: {1}<br>{2} {3},{4} {5}".format(entityInfo.EntityType, entity.DisplayName, entity.AddressLine, entity.Locality, entity.AdminDistrict, entity.PostalCode))]);
                                             },
                                             (error) => console.log('An error occured converting the response into an observable: ' + error)); 
                          });
					  	    }
}});

let constructMapPin = function(location, icon, tooltipText){
     let coords = {
         'latitude': location.latitude,
         'longitude': location.longitude
     };

     let pinOpts = {
         draggable: false,
         tooltipText: tooltipText,
         height: 40,
         width: 40,
         textOffset: new Microsoft.Maps.Point(0, 0)
     };

     if(icon)
        pinOpts['icon'] = '/lib/images/' + icon + '.png'

     return {location: coords, pinOptions: pinOpts};
};