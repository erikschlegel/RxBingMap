import utils from './lib/utils';
import pkg from './package.json';
import Rx from 'rx';
import RxDom from 'rx-dom';
import extend from 'extend';

export default class RxBing {
	constructor(options){
		let fromEvent = Rx.Observable.fromEvent;
		this.options = options;
		this.MapReferenceId = options.MapReferenceId;
		//utils.include(pkg.BingMapsLibrary);
		fromEvent(document.body, 'load')
	   .subscribe(this.initialize());	   
	}

	initialize(){
		if(this.options.BingTheme)
			this.UseBingTheme();
		
		this.render();
	}

	registerMapHandlers(customHandlers){
		Object.keys(customHandlers).forEach((eventName) => {
		   if(customHandlers.hasOwnProperty(eventName) && typeof customHandlers[eventName] === "function"){
		   		var RxSource = this.transformBingEventsToRxStream(this.map, eventName);
 			    RxSource.subscribe(customHandlers[eventName]);
	  	   }
		});
	}

	setCurrentPosition(){
		var source = Rx.DOM.geolocation.getCurrentPosition();

		var subscription = source.subscribe( myLocay => this.centerMap(myLocay.coords),
		  function (err) {
		    var message = '';
		    switch (err.code) {
		      case err.PERMISSION_DENIED:
		        message = 'Permission denied';
		        break;
		      case err.POSITION_UNAVAILABLE:
		        message = 'Position unavailable';
		        break;
		      case err.PERMISSION_DENIED_TIMEOUT:
		        message = 'Position timeout';
		        break;
		    }
		    console.log('Error: ' + message);
		  },
		  function () {
		    console.log('Completed');
		  });
	}

	centerMap(coordinates){
		    let mapConfig = this.map.getOptions();

            mapConfig.zoom = 15;
            mapConfig.center = {
                'latitude': coordinates.latitude,
                'longitude': coordinates.longitude
            };
            this.map.setView(mapConfig);

            let geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(this.map);
            geoLocationProvider.getCurrentPosition();
	}

	render(){
		let options = extend(true, {}, this.defaultOptions(), this.options);
		
		this.map = new Microsoft.Maps.Map(document.getElementById(this.MapReferenceId), options);
		if(options.CenterMap)
			this.setCurrentPosition();

		if(options.ShowTraffic)
			this.showTraffic();
	}

	showTraffic(){
		Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', { callback: () => new Microsoft.Maps.Traffic.TrafficManager(this.map).show()});
	}

	pushPins(pinSet){
		let source = Rx.Observable.from(pinSet)
					.subscribe( (pinMe) => {
							this.map.entities.push(pinMe);
						});
	}

	transformBingEventsToRxStream(map, action){
		var fromEventPattern = Rx.Observable.fromEventPattern;
		let handlerIdMap = {};

		var RxEvents = fromEventPattern(
		    function add (h) {
		        handlerIdMap[action] = Microsoft.Maps.Events.addHandler(map, action, h);
		    },
		    function remove (h) {
		        Microsoft.Maps.Events.removeHandler(handlerIdMap[action]);
		    }
		);

		return RxEvents;
	}

	UseBingTheme(){
		Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme', { callback: () => this.options = extend(true, {}, this.options, {theme: new Microsoft.Maps.Themes.BingTheme()}) } );
	}

	defaultOptions(){
		return {
			mapTypeId: Microsoft.Maps.MapTypeId.road,
			enableHighDpi: true,
			zoom: 12
		}
	}
}