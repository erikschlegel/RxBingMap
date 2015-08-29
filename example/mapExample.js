import RxBing from '../RxBing';

var map = new RxBing({MapReferenceId: "mapDiv", 
					  credentials: "AhbduxsPGweqi8L2tFcVTOM8o7yfT74gWSQw1mC8yTUyDVdePCF7cWJVFXq1wgl5", 
					  BingTheme: true,
					  CenterMap: true});

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
//map.centerMap({latitude: 40.735803, longitude: -74.001374});