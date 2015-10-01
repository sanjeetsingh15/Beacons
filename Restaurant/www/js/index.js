var app = (function()
{
	// Application object.
	var app = {};
    
    
	   
	// History of enter/exit events.
	var mRegionEvents = [];

	// Nearest ranged beacon.
	var mNearestBeacon = null;

	// Timer that displays nearby beacons.
	var mNearestBeaconDisplayTimer = null;

	// Background flag.
	var mAppInBackground = true;

	// Background notification id counter.
	var mNotificationId = 0;
    
    var myBeaNoti = 0;
    
    // Mapping of region event state names.
	// These are used in the event display string.
	var mRegionStateNames =
	{
		'CLRegionStateInside': 'Enter',
		'CLRegionStateOutside': 'Exit'
	};

	// Here monitored regions are defined.
	// TODO: Update with uuid/major/minor for your beacons.
	// You can add as many beacons as you want to use.
	var mRegions =
	[
		{
			id: 'region1',
			uuid: 'b9407f30-f5f8-466e-aff9-25556b57fe6d',
			major: 19787,
			minor: 59065
		},
		{
			id: 'region1',
			uuid: 'b9407f30-f5f8-466e-aff9-25556b57fe6d',
			major: 19787,
			minor: 59065
		}
	];

	// Region data is defined here. Mapping used is from
	// region id to a string. You can adapt this to your
	// own needs, and add other data to be displayed.
	// TODO: Update with major/minor for your own beacons.
	var mRegionData =
	{
		'region1': 'Region One',
		'region2': 'Region Two'
	};

	app.initialize = function()
	{   
        document.addEventListener('deviceready', onDeviceReady, true);
        document.addEventListener('resume', onAppToForeground, true);
        document.addEventListener('pause', onAppToBackground, true);
        
	};

	function onDeviceReady()
	{
        mAppInBackground = false;
        LocalNotificaiton(1,"deviceready");
        CallProcess();
    }
    
    function onAppToForeground()
	{ 
	   //mAppInBackground = false;
       LocalNotificaiton(3,"foreground");
       CallProcess();
    }
    
	function onAppToBackground()
	{
        mAppInBackground = true;
        LocalNotificaiton(2,"background");
        CallProcess();
    }

	
    
    function CallProcess(){ 
       // LocalNotificaiton(4,"Call Process");
        startMonitoringAndRanging();
		startNearestBeaconDisplayTimer();
		displayRegionEvents();
    }

	function startNearestBeaconDisplayTimer()
	{ // LocalNotificaiton(11,"startNearestBeaconDisplayTimer");
		mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 5000);
	}

	function stopNearestBeaconDisplayTimer()
	{
		clearInterval(mNearestBeaconDisplayTimer);
		mNearestBeaconDisplayTimer = null;
	}

	function startMonitoringAndRanging()
	{ //LocalNotificaiton(5, "StartMonitoring");
		function onDidDetermineStateForRegion(result)
		{
			saveRegionEvent(result.state, result.region.identifier);
			displayRecentRegionEvent();
		}

		function onDidRangeBeaconsInRegion(result)
		{
			updateNearestBeacon(result.beacons);
		}

		function onError(errorMessage)
		{
			console.log('Monitoring beacons did fail: ' + errorMessage);
		}

		// Request permission from user to access location info.
		cordova.plugins.locationManager.requestAlwaysAuthorization();

		// Create delegate object that holds beacon callback functions.
		var delegate = new cordova.plugins.locationManager.Delegate();
		cordova.plugins.locationManager.setDelegate(delegate);

		// Set delegate functions.
		delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
		delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;
        
		// Start monitoring and ranging beacons.
		startMonitoringAndRangingRegions(mRegions, onError);
	}

	function startMonitoringAndRangingRegions(regions, errorCallback)
	{ //LocalNotificaiton(12, "startMonitoringAndRangingRegions");
		// Start monitoring and ranging regions.
		for (var i in regions)
		{
			startMonitoringAndRangingRegion(regions[i], errorCallback);
		}
	}

	function startMonitoringAndRangingRegion(region, errorCallback)
	{ //LocalNotificaiton(13, "startMonitoringAndRangingRegion2");
		// Create a region object.
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			region.id,
			region.uuid,
			region.major,
			region.minor);

		// Start ranging.
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(errorCallback)
			.done();

		// Start monitoring.
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(errorCallback)
			.done();
	}

	function saveRegionEvent(eventType, regionId)
	{ //LocalNotificaiton(14, "saveRegionEvent");
		// Save event.
		mRegionEvents.push(
		{
			type: eventType,
			time: getTimeNow(),
			regionId: regionId
		});

		// Truncate if more than ten entries.
		if (mRegionEvents.length > 10)
		{
			mRegionEvents.shift();
		}
	}

	function getBeaconId(beacon)
	{
		return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
	}

	function isSameBeacon(beacon1, beacon2)
	{ //LocalNotificaiton(15, "isSameBeacon");
        
		return getBeaconId(beacon1) == getBeaconId(beacon2);
	}

	function isNearerThan(beacon1, beacon2)
	{ //LocalNotificaiton(16, "isNearerThan");
		return beacon1.accuracy > 0
			&& beacon2.accuracy > 0
			&& beacon1.accuracy < beacon2.accuracy;
	}

	function updateNearestBeacon(beacons)
	{ LocalNotificaiton(6,"Update Nearest Beacon"); LocalNotificaiton(7,beacons.length);
		for (var i = 0; i < beacons.length; ++i)
		{
			var beacon = beacons[i];
			if (!mNearestBeacon)
			{
				mNearestBeacon = beacon;
			}
			else
			{
				if (isSameBeacon(beacon, mNearestBeacon) ||
					isNearerThan(beacon, mNearestBeacon))
				{
					mNearestBeacon = beacon;
				}
			}
		}
	}

	function displayNearestBeacon()
	{  LocalNotificaiton(17, "displayNearestBeacon"); LocalNotificaiton(18,"hell"+ mNearestBeacon.uuid);
		if (!mNearestBeacon.uuid) { return; }
        
        var myBeaAdd = angular.element( document.querySelector( '#beaconMsg' ) );
   
		if(mNearestBeacon.uuid == 'b9407f30-f5f8-466e-aff9-25556b57fe6d' && myBeaNoti != 1){  myBeaNoti = 1;
            LocalNotificaiton(20,"Kumar");LocalNotificaiton(21,"App in background ? "+mAppInBackground);
            if(mAppInBackground == true){ LocalNotificaiton(19,"Suresh");
               //cordova.plugins.notification.local.clearAll(function() { }, this);
                cordova.plugins.notification.local.schedule({
                    id: 10,
                    title: "Special Offers true",
                    text: "A Special Offer for you.",
                    data: { beaconid:mNearestBeacon.uuid }
                });
                

                  cordova.plugins.notification.local.on("click", function (notification) {
                      if (notification.id == 10) {
                          displayNearestBeacon();
                      }
                  });
 
                myBeaNoti = 0;
                return; 
            }
           
		  var element = '<div class="card balanced-bg padding"><i style="color: white;font-size: 24px; padding: 5px 10px 5px 10px;" class="icon ion-close-circled right" onclick="closeBanner()"></i><a class="item clear-bg item-bg-image" ui-sref="app.lists"><h2>BREAKFAST</h2><img src="img/breakfast.jpg"></a></div>' + '<div style="height:50px; width:100%;"></div><div class="card energized-bg" style="padding:10px;"><p>UUIDUUID: ' + mNearestBeacon.uuid + '</p>' +	'<p>Major: ' + mNearestBeacon.major + '</p><p>Minor: ' + mNearestBeacon.minor + '</p><p>Proximity: ' + mNearestBeacon.proximity + '</p><p>Distance: ' + mNearestBeacon.accuracy + '</p><p>RSSI: ' + mNearestBeacon.rssi +'</p>';
		} else if(mNearestBeacon.uuid == 'b9407f30-f5f8-466e-aff9-25556b57fe6e'){R
		  var element = '<div class="card royal-bg padding"><a class="item clear-bg item-bg-image" ui-sref="app.lists"><h2>Lunch</h2><img src="img/lunch.jpg"></a></div>' + '<div style="height:50px; width:100%;"></div><div class="card energized-bg" style="padding:10px;"><p>UUIDUUID: ' + mNearestBeacon.uuid + '</p>' +	'<p>Major: ' + mNearestBeacon.major + '</p><p>Minor: ' + mNearestBeacon.minor + '</p><p>Proximity: ' + mNearestBeacon.proximity + '</p><p>Distance: ' + mNearestBeacon.accuracy + '</p><p>RSSI: ' + mNearestBeacon.rssi +'</p>';
        } else if(mNearestBeacon.uuid == 'b9407f30-f5f8-466e-aff9-25556b57fe6f'){
           var element = '<div class="card energized-bg padding"><a class="item clear-bg item-bg-image" ui-sref="app.lists"><h2>Dinner</h2><img src="img/dinner.jpg"></a></div>' + '<div style="height:50px; width:100%;"></div><div class="card energized-bg" style="padding:10px;"><p>UUIDUUID: ' + mNearestBeacon.uuid + '</p>' +	'<p>Major: ' + mNearestBeacon.major + '</p><p>Minor: ' + mNearestBeacon.minor + '</p><p>Proximity: ' + mNearestBeacon.proximity + '</p><p>Distance: ' + mNearestBeacon.accuracy + '</p><p>RSSI: ' + mNearestBeacon.rssi +'</p>';
        } else  {
            //var element = "";
        }
		  
        myBeaAdd.html(element);

	}

	function displayRecentRegionEvent()
	{ console.log("displayRecentRegionEvent 6666666666666"); console.log(mAppInBackground);
		if (mAppInBackground)
		{ 
		  LocalNotificaiton(8,"app in background");
		  if (!mNearestBeacon) { return; }
            LocalNotificaiton(9,"app in background 2");
		}
		else
		{ 
		  LocalNotificaiton(10,"App in foreground");
			displayRegionEvents();
		}
	}

	function displayRegionEvents()
	{ console.log("displayRegionEvents");

	}

	function getEventDisplayString(event)
	{ console.log("getEventDisplayString");
		return event.time + ': '
			+ mRegionStateNames[event.type] + ' '
			+ mRegionData[event.regionId];
	}

	function getTimeNow()
	{ console.log("getTimeNow");
		function pad(n)
		{
			return (n < 10) ? '0' + n : n;
		}

		function format(h, m, s)
		{
			return pad(h) + ':' + pad(m)  + ':' + pad(s);
		}

		var d = new Date();
		return format(d.getHours(), d.getMinutes(), d.getSeconds());
	}

	return app;

})();

function closeBanner(){ console.log("flush banner2222");
        var myBeaAdd = angular.element( document.querySelector( '#beaconMsg' ) );
        myBeaNoti = 1; console.log("status="+myBeaNoti);
		var element = '';
		  
        myBeaAdd.html(element);
    }
    
    function LocalNotificaiton(id, title){
       // cordova.plugins.notification.local.clearAll(function() { }, this);
        cordova.plugins.notification.local.schedule({
            id: id,
            title: title,
            text: title//,
            //data: { beaconid:mNearestBeacon.uuid }
        });
        
        cordova.plugins.notification.local.on("click", function (notification) {
            if (notification.id == 10) {
                displayNearestBeacon();
            }
        });
    }
app.initialize();