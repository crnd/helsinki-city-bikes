citybikes:
	mkdir -p dist/gfx/
	sass -t compressed --sourcemap=none src/scss/base.scss dist/site.min.css
	uglifyjs -o dist/app.min.js -c -m toplevel src/js/app.js
	sed -i -e "s/HEREAPPID/`cat apikeys | cut -d ' ' -f1`/g" dist/app.min.js
	sed -i -e "s/HEREAPPCODE/`cat apikeys | cut -d ' ' -f2`/g" dist/app.min.js
	cp src/index.html dist/index.html
	cp src/manifest.json dist/manifest.json
	cp src/robots.txt dist/robots.txt
	cp src/gfx/*-marker.svg dist/gfx/
	cp src/gfx/bike.png dist/gfx/
	cp src/gfx/bikes.jpg dist/gfx/
	cp src/gfx/hamburger.svg dist/gfx/
	cp src/gfx/user-locator.svg dist/gfx/

clean:
	rm -rf dist/ .sass-cache/
