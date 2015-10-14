import RxBingMap from '../RxBingMap';
import Rx from 'rx';
import Config from '../config.json'

var BingServicesImpl = require('./BingSpatialDataService');

if(!Config.BingMapsApiKey)
  throw Error("BingMapsApiKey is not defined error");

var map = new RxBingMap({MapReferenceId: "mapDiv",
					  credentials: Config.BingMapsApiKey,
            ServiceAPIKey: Config.BingServiceKey,
					  BingTheme: true,
					  CenterMap: true,
					  ShowTraffic: false});

let constructMapPin = function(location, icon, tooltipText){
                 let coords = {
                     'latitude': location.latitude,
                     'longitude': location.longitude
                 };

                 let pinOpts = {
                     draggable: false,
                     height: 40,
                     width: 40,
                     textOffset: new Microsoft.Maps.Point(0, 0)
                 };

                 if(tooltipText)
                   pinOpts['tooltipText'] = tooltipText;

                 if(icon)
                    pinOpts['icon'] = '/lib/images/' + icon + '.png';

                 return {location: coords, pinOptions: pinOpts};
};

//Call where am I to pin your current location
let whereAmiCall = (coords, mapReference) => {
  BingServicesImpl.whereAmI(coords, (response) => {
          Rx.Observable.from(BingServicesImpl.fromResponeToLocationResources(response))
                      .subscribe((location) => {
                          let newPin = constructMapPin(coords, '');
                          newPin.pinOptions.locationServiceCB = (location) => "<b><u>Bing Service Location</u></b>: {2}<br>Coordinates {0},{1}".format(location.point.coordinates[0], location.point.coordinates[1], location.name);
                          mapReference.pushPins([newPin]);
                      },
                      (error) => {
                             console.log("There was an error: " + error);
                      }
                    );
  });
};

map.registerMapHandlers({click: (result) => {
					  	      if(result.targetType == "map"){
                            map.clearEntities();//Avoid your browser dying slow and painfully
					  	      	      var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);

                            whereAmiCall(loc, map);
                            //Call Whats around me to pin your surroundings
                            BingServicesImpl.mySurroundings(loc, (response) => {
                                Rx.Observable.from(BingServicesImpl.fromResponseToSpatialEntities(response))
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
