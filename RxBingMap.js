import pkg from './package.json';
import Rx from 'rx';
import RxDom from 'rx-dom';
import extend from 'extend';

const defaultToolTipCssAlias = 'tooltip';
//only way to make a function a private member in ES6 classes, until ES7 is out and supports 'private'. 

export default class RxBing {
	constructor(options){
		let fromEvent = Rx.Observable.fromEvent;
		this.options = options;
		this.tooltipMap = new Map();
		this.MapReferenceId = options.MapReferenceId;
		this.options.tooltipCssAlias = this.options.tooltipCssAlias || defaultToolTipCssAlias;
		fromEvent(document.body, 'load')
	   .subscribe(this.initialize());	   
	}

	initialize(){
		if(this.options.BingTheme)
			this.UseBingTheme();
		
		this.render();
	}

	pushpinKey(pinLocation){
		return "{0}-{1}".format(pinLocation.latitude, pinLocation.longitude);
	}

	registerMapHandlers(customHandlers){
		this.registerRxEventSequence(customHandlers, this.map);
	}

	registerRxEventSequence(customHandlers, srcObject){
		Object.keys(customHandlers).forEach((eventName) => {
		   if(customHandlers.hasOwnProperty(eventName) && typeof customHandlers[eventName] === "function"){
		   		var RxSource = this.transformBingEventsToRxStream(srcObject, eventName);
 			    RxSource.subscribe(customHandlers[eventName], (error) => console.log('Event Handler occured for ' + eventName + ' Err: ' + error));
	  	   }
		});
	}

	createTooltip(pinDef){
			if(pinDef.pinOptions.tooltipText){
				let tipText = (!pinDef.pinOptions.tooltipText.startsWith('<div')?"<div class='qtip-bootstrap'>{0}</div>":"{0}").format(pinDef.pinOptions.tooltipText);
				var pinInfobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(pinDef.location.latitude, pinDef.location.longitude), {htmlContent: tipText, visible: false});
				this.tooltipMap.set(this.pushpinKey(pinDef.location), pinInfobox);
				this.map.entities.push(pinInfobox);
			}
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

	pushpinDefaultHandlers(options){
		return {
			mouseover: (ev) => {
				if(ev.targetType === 'pushpin' && this.tooltipMap.has(this.pushpinKey(ev.target._location))){
					let pin = ev.target;
					this.tooltipMap.get(this.pushpinKey(pin._location)).setOptions({visible: true});
				}
			},
			mouseout: (ev) => {
				if(ev.targetType === 'pushpin' && this.tooltipMap.has(this.pushpinKey(ev.target._location))){
					let pin = ev.target;
					this.tooltipMap.get(this.pushpinKey(pin._location)).setOptions({visible: false});
				}
			}
		}
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

	clearEntities(){
		this.map.entities.clear();
		this.tooltipMap.clear();
	}

	pushPins(pinSet, customHandlers){
		let source = Rx.Observable.from(pinSet)
					.subscribe( (pinDef) => {
							if(pinDef.location && pinDef.pinOptions){
 								this.createTooltip(pinDef, this.map);
 								var newPin = new Microsoft.Maps.Pushpin(pinDef.location, pinDef.pinOptions);
								this.registerRxEventSequence(extend(true, {}, this.pushpinDefaultHandlers(this.options), customHandlers || {}), newPin);
								this.map.entities.push(newPin);
							}else{
								console.error('Unable to add pin due to unprovided coords and/or opts');
							}
							
					} , (error) => console.log('An error occured adding the pin set to the map: ' + error));
	}

	transformBingEventsToRxStream(element, action){
		var fromEventPattern = Rx.Observable.fromEventPattern;
		let handlerIdMap = {};

		var RxEvents = fromEventPattern(
		    function add (h) {
		        handlerIdMap[action] = Microsoft.Maps.Events.addHandler(element, action, h);
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