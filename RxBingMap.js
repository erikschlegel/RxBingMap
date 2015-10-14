import pkg from './package.json';
import Rx from 'rx';
import RxDom from 'rx-dom';
import extend from 'extend';
var BingServices = require('rx-bing-services');

const defaultToolTipCssAlias = 'tooltip';
//only way to make a function a private member in ES6 classes, until ES7 is out and supports 'private'.

export default class RxBing {
	constructor(...args){
		if(args.length < 1)
		  throw new Error("Inavlid argument length. Expecting more than 0 arguments");

		this.options = args[0];
		let fromEvent = Rx.Observable.fromEvent;
		this.mapElement = args.length == 1 ? document.getElementById(this.options.MapReferenceId) : args[1];
		this.tooltipMap = new Map();
		this.MapReferenceId = this.options.MapReferenceId;
		this.options.tooltipCssAlias = this.options.tooltipCssAlias || defaultToolTipCssAlias;
		fromEvent(document.body, 'load').subscribe(this.initialize());
	}

	setupMapMovementObservable(userMovements){
		this.transitionViewSource = Rx.Observable.from(userMovements);
		this.transitionViewSource.subscribe( viewDefintion => this.map.setView(viewDefintion),
																				 error => console.error('An error occured processing the map view observable ' + error)
																			 );
	}

	initialize(){
		if(this.options.BingTheme)
			this.UseBingTheme();

		this.render();
		this.setupMapMovementObservable(this.options.initialMapViews || []);
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
				var infoBoxKey = this.pushpinKey(pinDef.location);
				let tipText = (!pinDef.pinOptions.tooltipText.startsWith('<div')?"<div id='{1}' class='qtip-bootstrap'>{0}</div>":"{0}").format(pinDef.pinOptions.tooltipText, infoBoxKey);
				var pinInfobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(pinDef.location.latitude, pinDef.location.longitude), {htmlContent: tipText, visible: false, id: infoBoxKey});
				this.tooltipMap.set(infoBoxKey, pinInfobox);
				this.map.entities.push(pinInfobox);
			}
  }

	static RxToBingMapViewDefintion(rxLocation){
		let mapConfig = {};
				if(rxLocation){
					mapConfig.zoom = 15;
					mapConfig.animate = true;
					mapConfig.center = {
							'latitude': rxLocation.coords.latitude,
							'longitude': rxLocation.coords.longitude
					};

					if(rxLocation.coords.heading != null)
					   mapConfig.heading = rxLocation.coords.heading;
				}

			return mapConfig;
	}

	setCurrentPosition(){
		var source = Rx.DOM.geolocation.getCurrentPosition();

		var subscription = source.subscribe( myLocay => this.addTransitionViewSequences([RxBing.RxToBingMapViewDefintion(myLocay)]),
		  (err) => {
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

	addTransitionViewSequences(transitions){
		 if(this.transitionViewSource){
		     this.transitionViewSource.concat(Rx.Observable.from(transitions))
		 	 	 	 											  .subscribe(viewDefintion => this.map.setView(viewDefintion),
																						 error => console.error('An error occured processing the map view observable ' + error));
		 }
	}

	pushpinDefaultHandlers(options){
		return {
			mouseover: (ev) => {
				if(ev.targetType === 'pushpin' && this.tooltipMap.has(this.pushpinKey(ev.target._location))){
					let pin = ev.target;
					this.tooltipMap.get(this.pushpinKey(pin._location)).setOptions({visible: true});
					//$(ev.originalEvent.relatedTarget).fadeIn('200');
				}
			},
			mouseout: (ev) => {
				if(ev.targetType === 'pushpin' && this.tooltipMap.has(this.pushpinKey(ev.target._location))){
					var tooltip = document.getElementById(this.pushpinKey(ev.target._location));
					//$(tooltip).fadeOut("slow");
					tooltip.classList.add('fade-out');
					//this.tooltipMap.get(this.pushpinKey(pin._location)).setOptions({visible: false});
				}
			}
		}
	}

	render(){
		let options = extend(true, {}, this.defaultOptions(), this.options);

		this.map = new Microsoft.Maps.Map(this.mapElement, options);
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

	createPushpin(pinDef, customHandlers){
		if(pinDef.location){
			  this.lookupPinLocation(pinDef, "{0},{1}".format(pinDef.location.latitude, pinDef.location.longitude));
				this.createTooltip(pinDef, this.map);
				var newPin = new Microsoft.Maps.Pushpin(pinDef.location, pinDef.pinOptions || {});
				this.registerRxEventSequence(extend(true, {}, this.pushpinDefaultHandlers(this.options), customHandlers || {}), newPin);
				this.map.entities.push(newPin);

			return newPin;
		}else{
			console.error('Unable to add pin due to unprovided coords');
		}
	}

 lookupPinLocation(pinDef, coordinates){
		let callback = pinDef.pinOptions.locationServiceCB || this.options.locationServiceCB;

		if(this.options.ServiceAPIKey && callback){
			  pinDef.pinOptions.tooltipText = false;

				let rsp = BingServices.whereAmI({
						apiKey: this.options.ServiceAPIKey,
						location: coordinates
				} , {
					error: function (e){
						console.log('Received a validation error:\n', e);
					}
				}).subscribe((rspSequence) => {
					Rx.Observable.from(BingServices.fromResponeToLocationResources(rspSequence))
											 .subscribe(location => {
												                       pinDef.pinOptions.tooltipText = callback(location);
																							 this.createTooltip(pinDef, this.map);
																						  });
					},
					error => console.log("There was an error with retreiving location {0}. Error: {1}".format(coordinates, error))
				);
		}
	}

	pushPins(pinSet, customHandlers){
		let source = Rx.Observable.from(pinSet)
					.subscribe( (pinDef) => {
							this.createPushpin(pinDef, customHandlers);
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
			zoom: 12,
			BingTheme: true,
      CenterMap: true,
      ShowTraffic: false
		}
	}
}

String.prototype.format = function(){
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);
   }
   return content;
};
