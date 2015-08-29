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

	setCurrentPosition(){
	    if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let options = this.map.getOptions();

                if (options) {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;
                    options.center = new Microsoft.Maps.Location(lat, lon);
                }

                this.map.setView(options);
            });
        }
	}

	render(){
		let options = extend(true, {}, this.defaultOptions(), this.options);
		
		this.map = new Microsoft.Maps.Map(document.getElementById(this.MapReferenceId), options);
		this.setCurrentPosition();	
		var RxSource = this.transformBingEventsToRxStream(this.map, 'map.click');
		RxSource.subscribe(this.options.mapClickHandler);
	}

	transformBingEventsToRxStream(map, action){
		var fromEventPattern = Rx.Observable.fromEventPattern;
		let handlerIdMap = {};

		var RxEvents = fromEventPattern(
		    function add (h) {
		        handlerIdMap[action] = Microsoft.Maps.Events.addHandler(map, 'click', h);
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