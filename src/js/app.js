window.onload = function () {

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

	// Fetch the status of bike stations.
	var bikeRequest = new XMLHttpRequest();
	bikeRequest.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			var markerOptions = {
				min: 13
			};

			// Draw a marker on the map for each bike station
			// with marker color representing the amount of available bikes.
			JSON.parse(this.response).stations.forEach(function (station) {
				var totalSpaces = station.bikesAvailable + station.spacesAvailable;
				markerOptions.data = {
					name: station.name,
					bikesAvailable: station.bikesAvailable,
					spacesAvailable: station.spacesAvailable
				};
				if (station.bikesAvailable === 0) {
					markerOptions.icon = noBikesIcon;
				} else if (station.bikesAvailable / totalSpaces < 0.25 || station.bikesAvailable <= 2) {
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
							content: '<h1>' + station.name + '</h1><p>' +
								station.bikesAvailable + ' of ' + totalSpaces + ' bikes available</p>'
						});
					ui.addBubble(bubble);
				});
				map.addObject(marker);
			})
		}
	}
	bikeRequest.open('GET', 'https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental', true);
	bikeRequest.send();

	// Store the zoom level and center coordinates from the map every time dragging stops.
	map.addEventListener('dragend', function (event) {
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
		document.getElementById('user-locator').addEventListener('click', function (event) {
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
