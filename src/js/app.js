window.onload = function () {

	// Show the greeting dialog if the user is on the page for the first time.
	if (localStorage.getItem('greetingShown') === null) {
		document.getElementById('greeting-wrapper').className = '';
		localStorage.setItem('greetingShown', 'yup');
	}

	// Close the greeting dialog from the button.
	document.getElementById('close-greeting').addEventListener('click', function () {
		document.getElementById('greeting-wrapper').className = 'hidden';
	});

	// Open the greeting dialog again from the hamburger button.
	document.getElementById('greeting-dialog-opener').addEventListener('click', function () {
		document.getElementById('greeting-wrapper').className = '';
	});

	// Colored marker icons for bike stations.
	var noBikesIcon = new H.map.Icon('gfx/red-marker.svg');
	var someBikesIcon = new H.map.Icon('gfx/yellow-marker.svg');
	var enoughBikesIcon = new H.map.Icon('gfx/green-marker.svg');

	// Initialize the map.
	var platform = new H.service.Platform({
		app_id: 'HEREAPPID',
		app_code: 'HEREAPPCODE',
		useCIT: true,
		useHTTPS: true
	});
	var defaultLayers = platform.createDefaultLayers();
	var map = new H.Map(document.getElementById('map'), defaultLayers.normal.map);
	var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
	var ui = H.ui.UI.createDefault(map, defaultLayers);
	window.addEventListener('resize', function () {
		map.getViewPort().resize();
	});

	// Try to fetch the coordinates where the map was centered last time.
	var lastMapCoordinatesJson = localStorage.getItem('lastLocation');
	if (lastMapCoordinatesJson !== null) {
		var lastMapCoordinates = JSON.parse(lastMapCoordinatesJson);
		map.setCenter(lastMapCoordinates);
	} else {
		map.setCenter({
			lat: 60.170572,
			lng: 24.941821
		});
	}

	// Try to fetch the zoom level that was used last time.
	var lastMapZoomLevel = localStorage.getItem('lastZoomLevel');
	if (lastMapZoomLevel !== null) {
		map.setZoom(lastMapZoomLevel);
	} else {
		map.setZoom(17);
	}

	// Fetch the status of bike stations immediately and then in intervals.
	var markerGroup = new H.map.Group();
	(function updateStations() {
		var bikeStationRequest = new XMLHttpRequest();
		bikeStationRequest.onreadystatechange = function () {
			if (this.readyState === 4 && this.status === 200) {
				var markerOptions = {
					min: 13
				};

				// Draw a marker on the map for each bike station
				// with marker color representing the amount of available bikes.
				var markers = [];
				JSON.parse(this.response).stations.forEach(function (station) {
					var bubbleContent = '<h1>' + station.name + '</h1><p>' + station.bikesAvailable;
					if (station.bikesAvailable === 1) {
						bubbleContent += ' bike available</p>';
					} else {
						bubbleContent += ' bikes available</p>';
					}
					markerOptions.data = {
						name: station.name,
						bikesAvailable: station.bikesAvailable,
						spacesAvailable: station.spacesAvailable
					};
					if (station.bikesAvailable === 0) {
						markerOptions.icon = noBikesIcon;
					} else if (station.bikesAvailable <= 2) {
						markerOptions.icon = someBikesIcon;
					} else {
						markerOptions.icon = enoughBikesIcon;
					}
					var marker = new H.map.Marker({
						lat: station.y,
						lng: station.x
					}, markerOptions);
					marker.addEventListener('tap', function (event) {
						var bubble = new H.ui.InfoBubble(
							event.target.getPosition(),
							{
								content: bubbleContent
							});
						ui.addBubble(bubble);
					});
					markers.push(marker);
				});

				markerGroup.removeAll();
				markerGroup.addObjects(markers);
				map.addObject(markerGroup);
			}
		}
		bikeStationRequest.open('GET', 'https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental', true);
		bikeStationRequest.send();
		setTimeout(updateStations, 180000);
	})();

	// Store the zoom level and center coordinates from the map every time dragging stops.
	map.addEventListener('mapviewchangeend', function () {
		localStorage.setItem('lastZoomLevel', map.getZoom());
		localStorage.setItem('lastLocation', JSON.stringify(map.getCenter()));
	});

	if ('geolocation' in navigator) {
		var currentUserLocation = {
			lat: 0,
			lng: 0
		};

		// Create a placeholder marker for the user location.
		var userLocationMarker = new H.map.Marker(currentUserLocation, {visibility: false});
		map.addObject(userLocationMarker);

		// Create an event handler for centering the map to the location of the user
		// when user locator button has been clicked.
		document.getElementById('user-locator').addEventListener('click', function () {
			map.setCenter(currentUserLocation);
		});

		navigator.geolocation.watchPosition(function (position) {
			currentUserLocation.lat = position.coords.latitude;
			currentUserLocation.lng = position.coords.longitude;

			// Move the user location marker to the actual user position and make it visible.
			userLocationMarker.setPosition(currentUserLocation);

			// Make the user location marker and user locator button visible.
			userLocationMarker.setVisibility(true);
			document.getElementById('user-locator').className = '';
		})
	}
}
