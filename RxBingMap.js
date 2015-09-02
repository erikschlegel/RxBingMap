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

	pushPins(pinSet, customHandlers){
		let source = Rx.Observable.from(pinSet)
					.subscribe( (pinMe) => {
							if(customHandlers)
								this.registerRxEventSequence(customHandlers, pinMe);

							this.map.entities.push(pinMe);
							createTooltip(pinMe);
					} , (error) => console.log('An error occured adding the pin set to the map: ' + error));
	}

	createTooltip(pin){
		if(pin.tooltip){
			let domTarget = pin.cm1002_er_etr.dom,
                container = '.' + pin.tooltipCssAlias + '_container_bottom', wt, ml;

                let tooltip = "<div class='{0}'><div class='{1}_content'>{2}</div></div>".format(container, pin.tooltipCssAlias, pin.tooltip);

                $(domTarget).after(tooltip);

                wt = $(container).outerWidth();
                ml = -(wt / 2 + 20);

                $(container).css('top', e.pageY + 20);
                $(container).css('left', e.pageX);
                $(container).css('margin-left', ml + 'px');

                $(container).fadeIn('200');
		}
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