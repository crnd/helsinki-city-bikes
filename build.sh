#!/bin/bash
if [ -r apikeys ]; then
	read -a keys <apikeys
	if [ -d dist ]; then
		rm dist/* 2> /dev/null
	else
		mkdir dist
	fi
	if [ -d dist/gfx ]; then
		rm dist/gfx/* 2> /dev/null
	else
		mkdir dist/gfx
	fi
	sass -t compressed --sourcemap=none src/scss/base.scss dist/site.min.css
	if [ $? -eq 0 ]; then
		uglifyjs -o dist/app.min.js -c -m toplevel src/js/app.js
		if [ $? -eq 0 ]; then
			sed -i -e "s/HEREAPPID/${keys[0]}/g" dist/app.min.js
			sed -i -e "s/HEREAPPCODE/${keys[1]}/g" dist/app.min.js
			cp src/index.html dist/index.html
			cp src/manifest.json dist/manifest.json
			cp src/gfx/* dist/gfx/
			if [ $? -eq 0 ]; then
				echo Build created
			else
				echo ERROR: Copying HTML and graphics failed
			fi
		else
			echo ERROR: Minifying JavaScript failed
		fi
	else
		echo ERROR: SCSS to CSS conversion failed
	fi
else
	echo ERROR: Reading API keys
fi
