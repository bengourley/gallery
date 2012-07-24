gallery
=======

A responsive JS gallery. This gallery on contains the
basic structural styles required to make it function and
is completely skinnable.

A demo can be found at: http://bengourley.github.com/gallery/example/

## Dependencies:

This gallery depends on jQuery (DOM & events), Underscore (utilities)
and Morpheus (animation). The latter two are included in this repository
(with their respective licenses). It is recommended that you get jQuery from
a CDN.

# Usage:

```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="morpheus.min.js"></script>
<script src="underscore.min.js"></script>
<script src="gallery.js"></script>
<script src="my-gallery.js"></script>
```

`my-gallery.js`
```js

// Instantiate a gallery object
var gallery = new Gallery(options)

// Load some images
gallery.images([
    { ... }
  , { ... }
  , { ... }
])

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

...to be continued...