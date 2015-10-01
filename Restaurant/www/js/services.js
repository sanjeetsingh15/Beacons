angular.module('starter.services', [])

.factory('BeaCon', function() {
  // History of enter/exit events.
	var mRegionEvents = [];

	// Nearest ranged beacon.
	var mNearestBeacon = null;

	// Timer that displays nearby beacons.
	var mNearestBeaconDisplayTimer = null;

	// Background flag.
	var mAppInBackground = false;

	// Background notification id counter.
	var mNotificationId = 0;

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
	{ console.log('initialize')
		document.addEventListener('deviceready', onDeviceReady, false);
		document.addEventListener('pause', onAppToBackground, false);
		document.addEventListener('resume', onAppToForeground, false);
	};

	function onDeviceReady()
	{ console.log('device ready...');
		startMonitoringAndRanging();
		startNearestBeaconDisplayTimer();
		displayRegionEvents();
	}

	function onAppToBackground()
	{
		mAppInBackground = true;
		stopNearestBeaconDisplayTimer();
	}

	function onAppToForeground()
	{
		mAppInBackground = false;
		startNearestBeaconDisplayTimer();
		displayRegionEvents();
	}

	function startNearestBeaconDisplayTimer()
	{  console.log('startNearestBeaconDisplayTimer');
		mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 1000);
	}

	function stopNearestBeaconDisplayTimer()
	{
		clearInterval(mNearestBeaconDisplayTimer);
		mNearestBeaconDisplayTimer = null;
	}

	function startMonitoringAndRanging()
	{ console.log('startMonitoringAndRanging');
		function onDidDetermineStateForRegion(result)
		{ console.log("1"); console.log(result);
			saveRegionEvent(result.state, result.region.identifier);
			displayRecentRegionEvent();
		}

		function onDidRangeBeaconsInRegion(result)
		{ console.log("2"); console.log(result);
			updateNearestBeacon(result.beacons);
		}

		function onError(errorMessage)
		{ console.log("3"); console.log(errorMessage);
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
        console.log("delegates=>"); console.log(delegate);
		// Start monitoring and ranging beacons.
		startMonitoringAndRangingRegions(mRegions, onError);
	}

	function startMonitoringAndRangingRegions(regions, errorCallback)
	{ console.log("startMonitoringAndRangingRegions");
		// Start monitoring and ranging regions.
		for (var i in regions)
		{
			startMonitoringAndRangingRegion(regions[i], errorCallback);
		}
	}

	function startMonitoringAndRangingRegion(region, errorCallback)
	{ console.log("startMonitoringAndRangingRegion");
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
	{ console.log("saveRegionEvent");
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
	{ console.log("getBeaconId"); console.log(beacon);
		return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
	}

	function isSameBeacon(beacon1, beacon2)
	{ console.log("isSameBeacon"); console.log("first"+beacon1); console.log("Second"+beacon2);
		return getBeaconId(beacon1) == getBeaconId(beacon2);
	}

	function isNearerThan(beacon1, beacon2)
	{ console.log("isNearerThan");
		return beacon1.accuracy > 0
			&& beacon2.accuracy > 0
			&& beacon1.accuracy < beacon2.accuracy;
	}

	function updateNearestBeacon(beacons)
	{ console.log("55"); console.log(beacons);
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
	{ console.log("66"); console.log(mNearestBeacon);
		if (!mNearestBeacon) { return; }

		// Clear element.


		// Update element.
		var element = 
			'Nearest Beacon<br />'
			+	'UUID: ' + mNearestBeacon.uuid + '<br />'
			+	'Major: ' + mNearestBeacon.major + '<br />'
			+	'Minor: ' + mNearestBeacon.minor + '<br />'
			+	'Proximity: ' + mNearestBeacon.proximity + '<br />'
			+	'Distance: ' + mNearestBeacon.accuracy + '<br />'
			+	'RSSI: ' + mNearestBeacon.rssi + '<br />'
			+ '</li>';
		
        var e = document.createElement('label');
        e.innerText = element;

        document.body.appendChild(e);   
        cordova.plugins.locationManager.isAdvertisingAvailable()
    .then(function(isSupported){
        console.log("isSupported: "); console.log(isSupported);
    })
    .fail(console.error);   
	}

	function displayRecentRegionEvent()
	{ console.log("displayRecentRegionEvent");
		if (mAppInBackground)
		{
			// Set notification title.
			var event = mRegionEvents[mRegionEvents.length - 1];
			if (!event) { return; }
			var title = getEventDisplayString(event);

			// Create notification.
			cordova.plugins.notification.local.schedule({
    			id: ++mNotificationId,
    			title: title });
		}
		else
		{
			displayRegionEvents();
		}
	}

	function displayRegionEvents()
	{ console.log("displayRegionEvents");
		// Clear list.


		// Update list.
		for (var i = mRegionEvents.length - 1; i >= 0; --i)
		{
			var event = mRegionEvents[i];
			var title = getEventDisplayString(event);
			var element = 
				'<li>'
				+ '<strong>' + title + '</strong>'
				+ '</li>'
				;
	
        var e = document.createElement('label');
        e.innerText = element;

        var br = document.createElement('br');
        var br2 = document.createElement('br');
        document.body.appendChild(e);
        document.body.appendChild(br);
        document.body.appendChild(br2);
		}

		// If the list is empty display a help text.
		if (mRegionEvents.length <= 0)
		{
			var element = 
				'Waiting for region events, please move into or out of a beacon region.'
			;
			var e = document.createElement('label');
        e.innerText = element;

        document.body.appendChild(e);
		}
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
});
