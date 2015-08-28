import RxBing from '../RxBing';

var map = new RxBing({MapReferenceId: "mapDiv", 
					  credentials: "AhbduxsPGweqi8L2tFcVTOM8o7yfT74gWSQw1mC8yTUyDVdePCF7cWJVFXq1wgl5", 
					  BingTheme: true,
					  mapClickHandler: (result) => {
					  	      if(result.targetType == "map"){
					  	      	    var point = new Microsoft.Maps.Point(result.getX(), result.getY());
                  					var loc = result.target.tryPixelToLocation(point);
					  	      	  console.log("Clicked " + loc.latitude + ", " + loc.longitude);
					  	      }
					  }});