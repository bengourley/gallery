/**
 * gallery.js
 * ==========
 * https://github.com/bengourley/gallery
 * Licenced under the New BSD License
 */

(function () {

/**
 * Construct a Gallery object
 */
function Gallery(options) {

  var defaults =
    { interval: 5000
    , transitionTime: 300
    , viewingHeight: 500
    , thumbnailSize:
      { height: 78
      , width: 128
      }
    , thumbnailTrackHeight: 78
    , animateFn: 'animate'
    , structureTemplate: this.structureTemplate
    , captionTemplate: this.captionTemplate
    }

  // Calling Gallery without 'new' is ok...
  if (!(this instanceof Gallery)) return new Gallery(options)

  // Merge defaults and custom options
  this.options = _.extend({}, defaults, options)

  this.previous = []
  this.interval = null
  this.loop = true

  // Ensure required option is set
  if (typeof this.options.selector === 'undefined') {
    throw new Error('`selector` is a required option')
  }


  // Get root element
  this.root = $(this.options.selector)
  this.root.append(this._renderStructure())
  $(window).on('resize', _.bind(this._handleResize, this))

}

Gallery.prototype.structureTemplate = _.template(
  [ '<div class="gallery-container">'
  , '  <div class="gallery-main">'
  , '    <div class="gallery-controls"/>'
  , '    <div class="gallery-loading">Loading…</div>'
  , '  </div>'
  , '  <div class="gallery-caption"/>'
  , '  <div class="gallery-thumb-reel">'
  , '    <button class="gallery-thumb-reel-left"><i>←</i></button>'
  , '    <button class="gallery-thumb-reel-right"><i>→</i></button>'
  , '    <div class="gallery-thumb-reel-viewport">'
  , '      <div class="gallery-thumb-reel-track"/>'
  , '    </div>'
  , '  </div>'
  , '</div>'
  ].join('\n'))

Gallery.prototype.captionTemplate = _.template(
  [ '<p class="gallery-caption-text"><%= caption %></p>'
  , '<p class="gallery-caption-count"><%= index %> of <%= total %></p>'
  , '<p class="gallery-caption-credit"> Image credit: <%= credit %></p>'
  ].join('\n'))

// Public API

/**
 * Load images into the gallery. `images` should
 * be and array objects that look like this:
 *
 *   { full: 'http://... or /...'
 *   , thumb: 'http://... or /...'
 *   , caption: 'This is the image caption'
 *   , credit: 'This is the image credit'
 *   }
 *
 */
Gallery.prototype.images = function (images) {
  this.images = images
  this._renderThumbReel()
  return this
}

/**
 * Transition to the next image.
 */
Gallery.prototype.next = function (pause) {
  this.goTo(this.index + 1, pause)
  return this
}

/**
 * Transition to the previous image.
 */
Gallery.prototype.prev = function (pause) {
  this.goTo(this.index - 1, pause)
  return this
}

/**
 * Transition to image `index`. If `pause` is truthy,
 * the autoplay will be paused.
 */
Gallery.prototype.goTo = function (index, pause) {

  if (pause) clearInterval(this.interval)

  // Loop back to zero?
  if (index === this.images.length && this.options.loop) {
    index = 0
  }

  // Don't error if asked to go to an image that
  // doesn't exist, or the current image. Return silently
  if (index < 0 || index >= this.images.length || index === this.index) {
    return this
  }

  $(this).trigger('change', index)

  var image = this.images[index]

  if (this.current) this.previous.push(this.current)

  // Show loader
  this.el.loading.css({ display: 'block', opacity: 0 })
  this.el.loading.stop()[this.options.animateFn]({
    opacity: 1
  }, 50)

  this._renderImage(image, _.bind(this._showNextImage, this))

  this.index = index
  return this

}

/**
 * Pause the autoplay feature.
 */
Gallery.prototype.pause = function () {
  clearInterval(this.interval)
  return this
}

/**
 * Resume the autoplay feature from the current image
 */
Gallery.prototype.resume = function () {
  clearInterval(this.interval)
  this.interval = setInterval(_.bind(function () {
    this.next()
  }, this), this.options.interval)
  this.goTo(this.index)
  return this
}


/**
 * Run through images automatically. Starts from
 * `index` or zero
 */
Gallery.prototype.play = function (index) {
  clearInterval(this.interval)
  this.interval = setInterval(_.bind(function () {
    if (this.index === this.images.length - 1) {
      this.goTo(0)
    } else {
      this.next()
    }
  }, this), this.options.interval)
  this.goTo(index || 0)
  return this
}

/*
 * Update the viewing height to given height `h`.
 */
Gallery.prototype.updateViewingHeight = function (h) {
  this.options.viewingHeight = h
  this.el.main.height(h)
  this._updateImage(this.current)
  return this
}

/**
 * Add/remove no-scroll class from
 * the thumbreel based on whether it
 * it is full enough to scroll.
 */
Gallery.prototype.checkThumbScroll = function () {
  var track = this.el.thumbReel.find('.gallery-thumb-reel-track')
  , last = track.find('.gallery-thumbnail').last()

  if (last.position().left + last.width() <= track.parent().width()) {
    this.el.thumbReel.addClass('no-scroll')
  } else {
    this.el.thumbReel.removeClass('no-scroll')
  }
}

// Private API

/**
 * Render the structure of the gallery
 */
Gallery.prototype._renderStructure = function () {

  // Ensure the root is empty
  this.root.empty()
  this.el = {}

  // Render the template
  var structure = $(this.options.structureTemplate({}))

  // Cache the main element and set structrual styles
  this.el.main = structure.find('.gallery-main')
    .height(this.options.viewingHeight)

  // Cache the caption element and set structrual styles
  this.el.caption = structure.find('.gallery-caption')

  // Cache the thumbreel element and set structrual styles
  this.el.thumbReel = structure.find('.gallery-thumb-reel')
    .height(this.options.thumbnailTrackHeight)

  this.el.thumbReel.find('.gallery-thumb-reel-viewport')
    .height(this.options.thumbnailTrackHeight)
  this.el.thumbReel.find('.gallery-thumb-reel-left')
    .height(this.options.thumbnailSize.height)
  this.el.thumbReel.find('.gallery-thumb-reel-right')
    .height(this.options.thumbnailSize.height)

  // Cache the loading element and hide it
  this.el.loading = structure.find('.gallery-loading').hide()

  // Cache controls element and build the prev/next buttons
  this.el.controls = structure.find('.gallery-controls')

  var next = $('<button/>')
        .text('Next')
        .addClass('gallery-controls-next')
        .on('click', _.bind(function () {
          this.next(true)
        }, this))
    , prev = $('<button/>')
        .text('Prev')
        .addClass('gallery-controls-prev')
        .on('click', _.bind(function () {
          this.prev(true)
        }, this))

  this.el.controls
    .append(prev)
    .append(next)

  // Hide controls at first/last images
  $(this).on('change', _.bind(function (e, i) {
    if (i === 0) {
      prev.addClass('disabled')
    } else {
      prev.removeClass('disabled')
    }
    if (i === this.images.length - 1) {
      next.addClass('disabled')
    } else {
      next.removeClass('disabled')
    }
  }, this))

  return structure

}

/**
 * Render a single image
 */
Gallery.prototype._renderImage = function (image, callback) {

  var img = new Image()

    , handleLoad = _.bind(function () {
        var i = $(img)
        i
          .attr('alt', image.caption)
          .data('resolution', {
            height: img.height, width: img.width
          })

        this.current = i
        callback(i)

      }, this)

    , handleError = _.bind(function (e) {

        callback($(new Image()))

      })

  $(img).on('load', handleLoad)
  $(img).on('error', handleLoad)

  $(this).on('change', function () {
    $(img).off('load')
    $(img).off('error')
  })
  img.src = image.full

  return this

}

/**
 * Render the thumb reel
 */
Gallery.prototype._renderThumbReel = function () {

  var track = this.el.thumbReel.find('.gallery-thumb-reel-track')

  // Render each thumbnail
  _.each(this.images, function (image, index) {
    track.append(this._renderThumb(image, index))
  }, this)

  // Listen for change events on the gallery. If
  // the selected thumbnail is offscreen, scroll the
  // thumbnail track so it's in view
  $(this).on('change', function (e, index) {
    var thumb = track.find('.gallery-thumbnail').eq(index)

    if (thumb.position().left + thumb.width() >
        track.parent().width() - parseInt(track.css('left'), 10)) {

      // Offscreen to the right
      var last = track.find('.gallery-thumbnail').last()

      track.stop()[this.options.animateFn]({
          left: Math.max(
              -(thumb.position().left + thumb.width() - track.parent().width())
            , -(last.position().left + last.width() - track.parent().width())
            )
      }, 300)

    } else if (-thumb.position().left > parseInt(track.css('left'), 10)) {

      // Offscreen to the left
      track.stop()[this.options.animateFn]({
          left: -thumb.position().left
      }, 300)

    }

  })

  this.el.thumbReel.find('.gallery-thumb-reel-right')
    .on('click', _.bind(function () {

      this.pause()

      var last = track.find('.gallery-thumbnail').last()
        , left = parseInt(track.css('left'), 10)
        , leftMax = -(last.position().left +
                              last.width() -
                   track.parent().width())

      // Items don't need to scroll
      if (last.position().left + last.width() <= track.parent().width()) {
        return
      }

      // Already scrolled to the end
      if (left === leftMax) {
        return
      }

      track.stop()[this.options.animateFn]({
          left: Math.max(
            left - track.parent().width(),
            leftMax
          )
      }, 300)

    }, this))

  this.el.thumbReel.find('.gallery-thumb-reel-left')
    .on('click', _.bind(function () {

      this.pause()

      var left = parseInt(track.css('left'), 10)
      track.stop()[this.options.animateFn]({
          left: Math.min(
            left + track.parent().width(),
            0
          )
      }, 300)

    }, this))

  this.checkThumbScroll()

  return this

}

/**
 * Render a single thumnbnail
 */
Gallery.prototype._renderThumb = function (image, index) {

  // Create the image and container
  var el = $('<div/>').addClass('gallery-thumbnail')
    , img = $('<div/>').addClass('gallery-thumbnail-image')

  // Listen for change events
  // to highlight current thumb
  $(this).on('change', function (e, i) {
    if (i === index) {
      el.addClass('selected')
    } else {
      el.removeClass('selected')
    }
  })

  el
    // Navigate on click
    .on('click', _.bind(function () {
      this.goTo(index, true)
    }, this))
    .height(this.options.thumbnailSize.height)
    .width(this.options.thumbnailSize.width)

  img
    .css({
        backgroundImage: 'url(' + image.thumb + ')'
      , backgroundRepeat: 'no-repeat'
      , backgroundPosition: 'center center'
      , height: this.options.thumbnailSize.height
      , width: this.options.thumbnailSize.width
    })

  el.append(img)

  return el

}

/**
 * Update the dimensions of a displayed image
 * element `el`. Useful when the image is first
 * draw, and when the browser is resized.
 */
Gallery.prototype._updateImage = function (el) {

  var imgWidth = el.data('resolution').width
    , imgHeight = el.data('resolution').height
    , mainWidth = this.el.main.width()
    , mainHeight = this.el.main.height()
    , widthRatio = imgWidth / mainWidth
    , heightRatio = imgHeight / mainHeight

  if (widthRatio > 1 || heightRatio > 1) {

    // Image is too big, fit to the most oversized
    // dimension and the other one will also fit
    if (widthRatio > heightRatio) {
      el.width(mainWidth)
      el.height((mainWidth / imgWidth) * imgHeight)
    } else {
      el.height(mainHeight)
      el.width((mainHeight / imgHeight) * imgWidth)
    }

  } else {

    // Render the image at its natural dimensions
    el.width(el.data('resolution').width)
    el.height(el.data('resolution').height)

  }

  // Center horizontally if rendered width
  // is less than container width
  if (el.width() < mainWidth) {
    el.css({ left: (mainWidth - el.width()) / 2 })
  } else {
    el.css({ left: 0 })
  }

  // Center vertically if rendered height
  // is less than container height
  if (el.height() < mainHeight) {
    el.css({ top: (mainHeight - el.height()) / 2 })
  } else {
    el.css({ top: 0 })
  }

  return this

}

/**
 * Handle a window#resize event
 */
Gallery.prototype._handleResize = function () {
  this._updateImage(this.current)
  return this
}

/**
 * Animate in the image at this.current
 */
Gallery.prototype._showNextImage = function () {

  // Hide loader
  this.el.loading.stop()[this.options.animateFn]({
    opacity: 0
  }, 50, _.bind(function () {
    this.el.loading.css({
        display: 'block'
      , opacity: 0
    })
  }, this))

  this.current.css({
    opacity: 0
  })

  this.el.main.prepend(this.current)

  this.current.stop()[this.options.animateFn]({
    opacity: 1
  }, 300)

  this._updateImage(this.current)

  this.el.caption.empty()
    .append(this.options.captionTemplate(_.extend(
      { index: this.index + 1
      , total: this.images.length
      }
      , this.images[this.index])))

  this._clearPrevious()

  return this

}

Gallery.prototype._clearPrevious = function () {
  var previous
  while (this.previous.length) {
    previous = this.previous.pop()
    previous.stop()[this.options.animateFn]({
      opacity: 0
    }, 300, _.bind(previous.remove, previous))
  }
  return this
}

// Expose constructor publicly

if (window.module && window.require) {
  window.module('Gallery', function (module) {
    module.exports = Gallery
  })
} else {
  window.Gallery = Gallery
}

}())