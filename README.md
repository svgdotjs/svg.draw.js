# svg.draw.js

An extension of [svg.js](https://github.com/svgdotjs/svg.js), which allows to draw elements with your mouse

# Demo

For a demo see http://svgdotjs.github.io/svg.draw.js/

# Get Started

Install the plugin:

```sh
npm install @svgdotjs/svg.js @svgdotjs/svg.draw.js
```

Include the script after svg.js into your page

```html
<script src="node_modules/@svgdotjs/svg.js"></script>
<script src="node_modules/@svgdotjs/svg.draw.js"></script>
```

Draw your first rectangle using this simple piece of code:

```html
<div id="myDrawing"></div>
<script>
  var canvas = new SVG().addTo('#myDrawing').size(500, 500)
  canvas.rect().draw() // Here we init a rectangle and start drawing it
</script>
```

# Usage

As default the drawing starts with a click on the SVG element

```js
canvas.rect().draw(options)
```

You can use your own mouse events. Just pass the event object to the `draw` Function

```js
var canvas = drawing.rect()

canvas.on('mousedown', function (event) {
  rect.draw(event, options)
})
canvas.on('mouseup', function (event) {
  rect.draw(event)
})
```

The addon automatically knows when to start or stop drawing (most shapes start with the first event and stop with the second). However, when dealing with e.g. a polygon, you are able to set new points with every event. To finish the drawing you have to call the `done` function. See the next chapter for that.

# Methods

`svg.draw.js` populates its methods it uses to draw the shape. This is useful in edgecases, but generally not needed (with some exceptions):

- `done` **must be called** to complete polygons/polylines
- `cancel` can be called on every shape to stop drawing and remove the shape

```js
// Finishes the poly-shape
polygon.draw('done')

// Cancels drawing of a shape, removes it
polygon.draw('cancel')

/* The following are only useful in edge-cases */

// Draws a new point with the help of a (mouse) event
polygon.draw('point', event)

// Draws the point while moving the mouse (basically the animation)
polygon.draw('update', event)

// Stop drawing, cleans up
polygon.draw('stop', event)
```

# Options

The following options can be used to modify the behavior of the addon:

- `snapToGrid`: Specifies the size of the grid to which a point is aligned (`default:1`)
- `drawCircles`: Specifies the need to draw little circles around the line/polyline/polygon points (`default: true`)

**Note** that you can specify the options only on the first call. When you want to change the options while drawing use `polygon.draw('params', key, value)` This is useful, for example if you only want to activate the grid option while CTRL is held down.

# Events

`svg.draw.js` fires a few specific events which are:

- drawstart
- drawstop
- drawupdate
- drawpoint
- drawdone
- drawcancel

These events are called at the end of the corresponding method.

Each event object holds the relative position to the parent object of the shape (which is mostly the SVG-doc itself) as an array

Binding a function to the event is easy

```js
var rect = canvas.rect().draw()
rect.on('drawstart', function (event) {
  console.log(event.detail) // Holds event, current point coords and matrix
})
```

# Plugins

Currently `svg.draw.js` only supports all the basic shapes (line, polyline, polygon, rect, image, circle, ellipse). Any other type you want to draw, can be added using a plugin which just serves the functions to draw the shape.

For example:

```js
SVG.Element.prototype.draw.extend('line polyline polygon', {

	// add methods here which should be added to the `draw` object
	// e.g.
	foo: function(){
		// can access this
	}

	// or even variables
	bar:5

}
```

The `calc` method is always needed which updates the point of the shape.

You can also extend two shape types at once:

```js
SVG.Element.prototype.draw.extend({

	'line polyline polygon': {
		// add methods here which should be added to the `draw` object
		// e.g.
		foo: function(){
			// can access this
		}

		// or even variables
		bar:5
	}


	'circle':{
		// something
	}
}
```

See the implementation of all shapes as examples.
