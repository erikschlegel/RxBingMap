import RxBing from '../RxBingMap';
import Rx from 'rx';
var BingServicesImpl = require('./BingSpatialDataService');

var map = new RxBing({MapReferenceId: "mapDiv", 
					  credentials: "AhbduxsPGweqi8L2tFcVTOM8o7yfT74gWSQw1mC8yTUyDVdePCF7cWJVFXq1wgl5", 
					  BingTheme: true,
					  CenterMap: true,
					  ShowTraffic: true});

map.registerMapHandlers({click: (result) => {
					  	      if(result.targetType == "map"){
					  	      	      var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);
					  	      	  	  map.pushPins([constructMapPin(loc, 'map-pin', "Selected location for {0},{1}".format(loc.latitude, loc.longitude))]);

                          //Call Whats around me to pin your surroundings
                          BingServicesImpl.mySurroundings(loc, (response) => {
                                Rx.Observable.from(BingServicesImpl.fromRspToSpatialEntities(response))
                                             .subscribe((entity) => {
                                                  let entityInfo = BingServicesImpl.getEntityTypeDetails(entity.EntityTypeID);
                                                  map.pushPins([constructMapPin({latitude: entity.Latitude, longitude: entity.Longitude}, 
                                                                                 entityInfo.icon, 
                                                                                 "<b>{0}</b>: {1}".format(entityInfo.EntityType, entity.DisplayName))]);
                                             },
                                             (error) => console.log('An error occured converting the response into an observable: ' + error));
                              
                          });
					  	      	  //console.log("Clicked " + loc.latitude + ", " + loc.longitude);
					  	    }
}});

let constructMapPin = function(location, icon, tooltipText){
     let coords = {
         'latitude': location.latitude,
         'longitude': location.longitude
     };

     let pinOpts = {
         htmlContent: '<i style="color: orange; margin:0px 0px 0px 0px;" class="fa fa-' + icon + '"></i>',
         draggable: true,
         textOffset: new Microsoft.Maps.Point(0, 0)
     };

     var pin = new Microsoft.Maps.Pushpin(coords, pinOpts);

     return {pin: pin, tooltip: tooltipText, tooltipCssAlias: 'tooltip'};
};

//map.centerMap({latitude: 40.735803, longitude: -74.001374});