svg.draw.js
===========

An extension of [svg.js](https://github.com/svgdotjs/svg.js) which allows to draw elements with your mouse

# Demo

For a demo see http://svgdotjs.github.io/svg.draw.js/

# Get Started

- Install `svg.draw.js` using bower:

		bower install svg.draw.js

- Include the script after svg.js into your page

		<script src="svg.js"></script>
		<script src="svg.draw.js"></script>

- Draw your first rectangle using this simple piece of code:

		<div id="myDrawing"></div>

		var drawing = new SVG('myDrawing').size(500, 500);
		drawing.rect().draw()	// Here we init a rectangle and start drawing it

# Usage

As default the drawing starts with a click on the svg-Element


    var drawing = SVG('drawing');
    drawing.rect().draw(options);


You can use your own mouse-events. Just pass the event-Object to the draw-Function


    var drawing = SVG('myDrawing');
    var rect = drawing.rect();

    drawing.on('mousedown', function(event){
        rect.draw(event, options);
    });
    drawing.on('mouseup', function(event){
        rect.draw(event);
    });

The addon automatically knows when to start or stop drawing (most shapes start with the first event and stop with the second).
However when dealing with e.g. a polygon you are able to set new points with every event. To finish the drawing you have to call the `done`-function.
See the next chapter for that.

# Methods

`svg.draw.js` populates its methods it uses to draw the shape. This is useful in edgecases but generally not needed. However the method `done` is needed for poly-shapes and `cancel` can be called on every shape to stop drawing and remove the shape.

	// Finishes the poly-shape
	polygon.draw('done');

	// Cancels drawing of a shape, removes it
	polygon.draw('cancel');

	/* The following are only useful in edge-cases */

	// Draws a new point with the help of (mouse-)event
	polygon.draw('point', event)

	// Draws the point while moving the mouse (basically the animation)
	polygon.draw('update', evnt)

	// Stop drawing, cleans up
	polygon.draw('stop', event)
	
# Options

The following options can be used to modify the behavior of the addon:

- `snapToGrid`: Specifies a grid to which a point is aligned (`default:1`)

**Note** that you can specify the options only on the first call. When you want to change the options while drawing use `polygon.draw('params', key, value)` This is useful when you want to activate the grid-option when ctrl or soemthing is pressed.

# Events

`svg.draw.js` fires a few specific events which are:

- drawstart
- drawstop
- drawupdate
- drawpoint
- drawdone
- drawcancel

These events are called at the end of the corresponding method.

Each event-object holds the relative position to the parent-Object of the Shape (which is mostly the SVG-doc itself) as Array

Binding a function to the Event is easy

    var draw = SVG('drawing');
    var rect = draw.rect().draw();
    rect.on('drawstart', function(event){
        console.log(event.detail); // Holds event, current Point-coords and matrix
    });

# Plugins

Currently `svg.draw.js` only supports all the basic shapes (line, polyline, polygone, rect, image, circle, ellipse).
Any other type you want to draw and is available through `SVG.invent` (e.g. image or your own element) can be added using a plugin which just serves the functions to draw the shape.

For example:


    SVG.Element.prototype.draw.extend('line polyline polygon', {

		// add methods here which should be added to the draw-object
		// e.g.
		foo: function(){
			// can access this
		}

		// or even variables
		bar:5

	}

Method `calc` is always needed which updates the point of the shape.

You also can extend two shape-types at once:

    SVG.Element.prototype.draw.extend({

		'line polyline polygon': {
			// add methods here which should be added to the draw-object
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

See the implementation of all shapes as examples.


# Changes in svg.draw.js v2

- all shapes implemented as plugins
- drawing takes transformations into account (you can even draw e.g. a rotated rectangle)
- useRadius option is obsolete duo to the implementation of circle in svg.js v2
