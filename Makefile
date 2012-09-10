all:build

build:
	uglifyjs src/gallery.js > gallery.min.js
	node_modules/.bin/stylus src/gallery.styl -o .

.PHONY: build