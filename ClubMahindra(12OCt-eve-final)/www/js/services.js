angular.module('starter.services', [])

.factory('BeaCon', function() {
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
	var mNotificationId1 = 0;
    var mNotificationId2 = 0;
    
    var myBeaNoti = 0;
    
    var myBeaNoti2 = 0;

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
			id: 'region2',
			uuid: 'b9407f30-f5f8-466e-aff9-25556b57fe6d',
			major: 58922,
			minor: 52684
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

	document.addEventListener('deviceready', onDeviceReady, false);
	document.addEventListener('pause', onAppToBackground, false);
	document.addEventListener('resume', onAppToForeground, false);
	

	function onDeviceReady()
	{
	    mAppInBackground = false;
		startMonitoringAndRanging();
		startNearestBeaconDisplayTimer();
		displayRegionEvents();
	}

	function onAppToBackground()
	{
		mAppInBackground = true;
		//stopNearestBeaconDisplayTimer();
        startMonitoringAndRanging();
        startNearestBeaconDisplayTimer();
		displayRegionEvents();
	}

	function onAppToForeground()
	{
		mAppInBackground = false;
        startMonitoringAndRanging();
		startNearestBeaconDisplayTimer();
		displayRegionEvents();
	}

	function startNearestBeaconDisplayTimer()
	{
		mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 1000);
	}

	function stopNearestBeaconDisplayTimer()
	{
		clearInterval(mNearestBeaconDisplayTimer);
		mNearestBeaconDisplayTimer = null;
	}

	function startMonitoringAndRanging()
	{
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
	{
		// Start monitoring and ranging regions.
		for (var i in regions)
		{
			startMonitoringAndRangingRegion(regions[i], errorCallback);
		}
	}

	function startMonitoringAndRangingRegion(region, errorCallback)
	{
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
	{
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
	{
		return getBeaconId(beacon1) == getBeaconId(beacon2);
	}

	function isNearerThan(beacon1, beacon2)
	{
		return beacon1.accuracy > 0
			&& beacon2.accuracy > 0
			&& beacon1.accuracy < beacon2.accuracy;
	}

	function updateNearestBeacon(beacons)
	{
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
	{  
	    if (!mNearestBeacon) { return; }
       
        if (!mNearestBeacon.uuid) { return; }
        
        if(mNearestBeacon.uuid == 'b9407f30-f5f8-466e-aff9-25556b57fe6d' && mNearestBeacon.major == '19787' && mNearestBeacon.minor == '59065' && myBeaNoti != 1){
            
            var myBeaAdd = angular.element( document.querySelector( '#beaconMsg' ) );
            
            var element = '<div><p style="float:left;padding: 10px;background-color:red;width: 100%;"><span style="color:#fff;font-size: 20px;font-weight: 900;">Welcome Kapil</span><i style="color: white;font-size: 24px; /* padding: 5px 10px 5px 10px; */ position:absolute;/* float: right; *//* width: 100%; *//* margin-right: -6px; */right: 10px;" class="icon ion-close-circled right" onclick="closeBanner()"></i></p><a onclick="mycart()"><img style="height:550px;width:100%;" src="img/welcome_screen.png"></a></div>';
            
            if(mAppInBackground == true && mNotificationId1 != 1){
                
                var now             = new Date().getTime(),
                scheduledTime = new Date(now + 1*60000);

                cordova.plugins.notification.local.schedule([{
                    id: 1,
                    title: "Hi Suresh, Welcome in Club Mahindra,",
                    text: "Welcome drinks will be served in lounge area.",
                    data: { beaconid:mNearestBeacon.uuid }
                }, {
                    id: 2,
                    title: "Club Mahindra,",
                    text: "Our RM will contact you there to hand over the keys and escort you to the room.",
                    at: scheduledTime,
                    data: { beaconid:mNearestBeacon.uuid }
                }]);
                

                  cordova.plugins.notification.local.on("click", function (notification) {
                      if (notification.id == 10) {
                          displayNearestBeacon();
                      }
                  });
                
                mNotificationId1 = 1;
                return;
            }
            myBeaNoti = 1;
            myBeaAdd.html("");  
            myBeaAdd.html(element);
        }
         if(mNearestBeacon.uuid == 'b9407f30-f5f8-466e-aff9-25556b57fe6d' && mNearestBeacon.major == '58922' && mNearestBeacon.minor == '52684' && myBeaNoti2 != 2){
		  
            var myBeaAdd = angular.element( document.querySelector( '#beaconMsg' ) );
            
            //var element = '<div style="height:570px; width:100%;"><p style="float:left;padding: 10px;background-color:red;width: 100%;"><span style="color:#fff;font-size: 20px;font-weight: 900;">Welcome Kapil</span><i style="color: white;font-size: 24px; /* padding: 5px 10px 5px 10px; */ position:absolute;/* float: right; *//* width: 100%; *//* margin-right: -6px; */right: 10px;" class="icon ion-close-circled right" onclick="closeBanner()"></i></p><a onclick="mycart()"><div class="list card" style="width:100%;"> <div class="item item-divider">Our Ext. Details</div><div class="item"> <p>Reception: 1234</p> <p>Laundry: 1235</p> <p>Room Service: 1236</p> <p>Management: 1237</p> </div> <div class="item item-divider">Our Password</div><div class="item"> <p>Your Locker Password: 1234</p> <p>Wifi Password: 1235</p> </div> <div style="width:100%; height:50px;"></div><a style="width:100%"; href="#/app/map" class="button button-full button-balanced">Point of interests Show on map</a></div></a></div>';
            
            var element = '<div style="height:570px; width:100%;"><p style="float:left;padding: 10px;background-color:red;width: 100%;"><span style="color:#fff;font-size: 20px;font-weight: 900;">Welcome Kapil</span><i style="color: white;font-size: 24px; position:absolute; right: 10px;" class="icon ion-close-circled right" onclick="closeBanner()"></i></p><img style="height: 130px; margin-top: -10px; width: 100%;" src="img/hotel-details.jpg"/> <div class="list"> <a style="padding-bottom: 2px; padding-top: 2px;" class="item item-icon-left item-icon-right" href="#"> <i class="icon ion-star"></i> <label style="font-size: 14px; color: #8A8A8A;" >Reception</label> <br /><span style="font-size: 18px;">5021</span> <i class="icon ion-ios-telephone" style="color: #3DBDF1;"></i> </a> <a style="padding-bottom: 2px; padding-top: 2px;" class="item item-icon-left item-icon-right" href="#"> <i class="icon ion-android-restaurant"></i> <label style="font-size: 14px;color: #8A8A8A;">Room Service</label> <br /><span style="font-size: 18px;">5045</span> <i class="icon ion-ios-telephone" style="color: #3DBDF1;"></i> </a> <a style="padding-bottom: 2px; padding-top: 2px;" class="item item-icon-left item-icon-right" href="#"> <i class="icon ion-soup-can"></i> <label style="font-size: 14px; color: #8A8A8A;">Laundry</label> <br /><span style="font-size: 18px;">5089</span> <i class="icon ion-ios-telephone" style="color: #3DBDF1;"></i> </a> </div> <div class="card"> <div class="item item-divider"> Wifi Details </div> <div style="padding-bottom: 5px; padding-top: 5px;" class="item item-text-wrap"> <label style="font-size: 14px;color: #8A8A8A;" >Network Name</label> <br /><span style="font-size: 18px;">Club Mahindra Wifi</span> </div> <div style="padding-bottom: 5px; padding-top: 5px;" class="item item-text-wrap"> <label style="font-size: 14px;color: #8A8A8A;" >Network Password</label> <br /><span style="font-size: 18px; ">XU784KIWS$</span> </div> </div> <div class="card"><a style="width:100%;" href="#/app/map" class="button button-full button-assertive"> Point Of Interest </a></div></div>';
            
            if(mAppInBackground == true && mNotificationId2 != 2){ //LocalNotificaiton(199,myBeaNoti2); LocalNotificaiton(1999,mNotificationId2);
               //cordova.plugins.notification.local.clearAll(function() { }, this);
                cordova.plugins.notification.local.schedule({
                    id: 3,
                    title: "Club Mahindra",
                    text: "Tap to see Hotel's Ext. passwords, and points of interests.",
                    data: { beaconid:mNearestBeacon.uuid }
                });
                

                  cordova.plugins.notification.local.on("click", function (notification) {
                      if (notification.id == 10) {
                          displayNearestBeacon();
                      }
                  });
 
                mNotificationId2 = 2;
                return; 
            } //LocalNotificaiton(888,rand);
            myBeaNoti2 = 2;
            myBeaAdd.html("");  
            myBeaAdd.html(element);
        }
		
	}

	function displayRecentRegionEvent()
	{
		if (mAppInBackground)
		{
			// Set notification title.
			var event = mRegionEvents[mRegionEvents.length - 1];
			if (!event) { return; }
			var title = getEventDisplayString(event);

			// Create notification.
			/**
 * cordova.plugins.notification.local.schedule({
 *     			id: ++mNotificationId,
 *     			title: title });
 */
		}
		else
		{
			displayRegionEvents();
		}
	}

	function displayRegionEvents()
	{
		
	}

	function getEventDisplayString(event)
	{
		return event.time + ': '
			+ mRegionStateNames[event.type] + ' '
			+ mRegionData[event.regionId];
	}

	function getTimeNow()
	{
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


    
});
