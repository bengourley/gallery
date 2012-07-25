gallery
=======

A responsive JS gallery. This gallery contains only the
structural styles required to make it function, so it is
is completely skinnable.

*Browser Support*: IE6+, Chrome, Firefox, Safari

A demo can be found at: http://bengourley.github.com/gallery/example/

## Dependencies:

This gallery depends on jQuery (DOM, events and animation) and Underscore
(templates, utilites). To take advantage of CSS transitions in capable
browsers, include https://github.com/benbarnett/jQuery-Animate-Enhanced/
on the page.

It is up to you to ensure these dependencies exist. In the example, these are
hotlinked from Google's CDN and GitHub. You should do something better in
production.

# Usage:

```html
<!-- HEAD -->
<link rel="stylesheet" href="gallery.css"/>

<!-- BODY -->
<script src="jquery.min.js"></script>
<script src="jquery.animate-enhanced.min.js"></script>
<script src="underscore.min.js"></script>
<script src="gallery.min.js"></script>
<script src="my-gallery.js"></script>
```

**my-gallery.js:**
```js

// Instantiate a gallery object
var gallery = new Gallery(options)

// Load some images
gallery.images([
    { ... }
  , { ... }
  , { ... }
])

// Each image object should look like this:
//
// { full: '...' // Path to fullsize image
// , thumb: '...' // Path to thumbnail image
// , caption: '...' // Image caption
// , credit: '...' // Image credit
// }

// Begin looping through the images (which
// pauses once user input is received)
gallery.start()

// or

// Just go to a particular image
gallery.goTo(0)
```

# API

## var gallery = new Gallery(options)

Construct a Gallery object. `new` is optional. Options should be
an object with some of the following properties:

- `selector`: Required. The selector of an existing element in the page.
- `interval`: Optional. The milliseconds between each image when autplaying. Default: 5000
- `transitionTime`: Optional. The milliseconds each transition should take. Default: 300
- `viewingHeight`: Optional. The amount of height for the image viewing area. Default: 500
- `thumbnailSize`: Optional. An object describing the desired thumbnail size. Default: `{ height: 78, width: 128 }`


## gallery.images(images)

Pass in the images you want the gallery to display. `images` should be an
array of objects with the following properties:

- `full`: Required. The url to the fullsize image.
- `thumb`: Required. The url to the thumbnail image.
- `caption`: Required. The image caption.
- `credit`: Required. The image credit.

`gallery.images(...)` must be called before any of the other API methods, otherwise
the gallery will have no images to use. This method does not actually load the images,
so you don't have to wait (or pass in a callback) before calling other methods. That means
you can also chain the API calls:

```js
var gallery = new Gallery(...)
  , images = [ ... ]

gallery
  .images(images)
  .play()
```

## gallery.goTo(index, pause)

Transition to image number `index`. If `pause` is truthy,
the autoplay will be paused.

## gallery.next(pause)

Transition to the next image. Passes `pause` on to `gallery.goTo()`.

## gallery.prev(pause)

Transition to the previous image. Passes `pause` on to `gallery.goTo()`.

## gallery.play(index)

Run through images automatically. Starts from `index` (optional defaulting to 0).

## gallery.pause()

Pauses the play feature.

## gallery.resume()

Resume the play feature from the current image.

# Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)