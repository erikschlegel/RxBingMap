import RxBing from '../RxBing';
import BingServices from 'machinepack-rxbingservices';

var map = new RxBing({MapReferenceId: "mapDiv", 
					  credentials: "AhbduxsPGweqi8L2tFcVTOM8o7yfT74gWSQw1mC8yTUyDVdePCF7cWJVFXq1wgl5", 
					  BingTheme: true,
					  CenterMap: true,
					  ShowTraffic: true});

map.registerMapHandlers({click: (result) => {
					  	      if(result.targetType == "map"){
					  	      	    var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);
                  					let coords = {
					                    'latitude': loc.latitude,
                    					'longitude': loc.longitude
                					};

                					let pinOpts = {
                						htmlContent: '<i style="color: orange; margin:0px 0px 0px 0px;" class="fa fa-map-pin"></i>',
                						draggable: true,
                						textOffset: new Microsoft.Maps.Point(0, 0)
                					};

					  	      	  	map.pushPins([new Microsoft.Maps.Pushpin(coords, pinOpts)]);
					  	      	  //console.log("Clicked " + loc.latitude + ", " + loc.longitude);
					  	      }
					  }});

BingServices.whatsAroundMe({
  apiKey: 'x',
  location: '40.735803,-74.001374',
  top: 20,
  radius: 1
}).exec({
  // An unexpected error occurred.
  error: function (e){
  	console.log('Received an error:\n', e);
  },
  // OK.
  success: function (result){
    console.log('Got:\n', result);
  },
});
//map.centerMap({latitude: 40.735803, longitude: -74.001374});