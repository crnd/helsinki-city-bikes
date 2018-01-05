# Helsinki City Bikes

Helsinki City Bikes is a simple UI for quickly checking the status of [Helsinki City Bike stations](https://www.hsl.fi/en/citybikes). The site uses the [HERE JavaScript API](https://developer.here.com/develop/javascript-api) to provide maps and utilizes HTML5 geolocation and web storage.

Live city bike station status is fetched from a [public REST API](https://api.digitransit.fi/routing/v1/routers/hsl/bike_rental).

## Demo

A demo site can be found at https://bikes.inhelsinki.com/.

## Build

There is a Shell script named ```build.sh``` that handles the build process.

### Prerequisites

 * SASS version 3.4.x
 * UglifyJS 3
 * ```apikeys``` single line file containing HERE app ID and code separated by a space

### Process

Build process can be started by running the ```build.sh``` shell script and it will create a local build to ```dist/``` directory.

Adding a deployment target after the ```build.sh``` shell script will deploy the contents of the ```dist/``` directory to the given target with SCP.

```
./build.sh username@example.com:/home/username/destination
```

The build process is as follows:
 * Compile CSS from SCSS
 * Minifiy JavaScript
 * Replace placeholders with actual HERE app ID and code
 * Copy required files to ```dist/```
 * Deploy with SCP if a target was given

## License

This project is licensed under the terms of the MIT license.