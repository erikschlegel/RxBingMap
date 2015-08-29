import RxBing from '../RxBing';

var map = new RxBing({MapReferenceId: "mapDiv", 
					  credentials: "AhbduxsPGweqi8L2tFcVTOM8o7yfT74gWSQw1mC8yTUyDVdePCF7cWJVFXq1wgl5", 
					  BingTheme: true});

map.registerMapHandlers({click: (result) => {
					  	      if(result.targetType == "map"){
					  	      	    var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);
                  					let coords = {
					                    'latitude': loc.latitude,
                    					'longitude': loc.longitude
                					};

					  	      	  	map.pushPins([new Microsoft.Maps.Pushpin(coords, {width: 50, height: 50, draggable: true})]);
					  	      	  //console.log("Clicked " + loc.latitude + ", " + loc.longitude);
					  	      }
					  }});
//map.centerMap({latitude: 40.735803, longitude: -74.001374});