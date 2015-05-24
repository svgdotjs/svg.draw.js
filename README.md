svg.draw.js
===========

An extension of svn.js which allows to draw elements with your mouse

# Get Started

- Install svg.draw.js` using bower:

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


    var draw = SVG('drawing');
    draw.rect().draw(options);


You can use your own mouse-events. Just pass the event-Object to the draw-Function


    var drawing = SVG('myDrawing');
    var rect = draw.rect();

    draw.on('mousedown', function(event){
        rect.draw(event, options);
    });
    draw.on('mouseup', function(event){
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

- `useRadius`: Only used for ellipse - Use the mouseposition to calculate the radius. <br>
   If `false` the mouse position will be corner of the bounding-box of the ellipse (default)
- `snapToGrid`: Specifies a grid to which a point is aligned (`default:1`)

**Note** that you can specify the options only on the first call. When you want to change the options while drawing use `polygon.draw('params', key, value)` This is useful when you want to activate the grid-option when ctrl or soemthing is pressed.

# Events

`svg.draw.js` fires a few specific events which are:

- drawstart
- drawstop
- drawudpdate
- drawpoint
- drawdone
- drawcancel

These events are called at the end of the corresponding method.

Each event-object holds the relative position to the parent-Object of the Shape (which is mostly the SVG-doc itself) as Array

Binding a function to the Event is easy

    var draw = SVG('drawing');
    draw.rect().draw();
    rect.on('drawstart', function(event){
        console.log(e.detail); // Prints the position [x,y] where drawing started
    });

# Plugins

Currently `svg.draw.js` only supports all the basic shapes (line, polyline, polygone, rect, ellipse).
Any other type you want to draw and is available through `SVG.invent` (e.g. image or your own element) can be added using a plugin which just serves the functions to draw the shape.

Here is an example for implementing the image-node-drawing (which is basically the same implementation as the rectangle):

	//svg.draw.image.js
	
	;(function(plugins){
	
	plugins.image = {
	
	    init:function(event){
	        var draw = { x: event.pageX, y: event.pageY, height: 1, width: 1 };
	        this.el.attr(draw);
	    }, 
	    
	    calc:function(event){
	        
			var draw = {
				x = this.parameters.x,
				y = this.parameters.y,
				height = this.parameters.height,
				width = this.parameters.width
			}

	        // Correct the Position
	        // the cursor-position is absolute to the html-document but our parent-element is not
	        draw.x -= this.parameters.offset.x;
	        draw.y -= this.parameters.offset.y;
	
	        // Snap the params to the grid we specified
	        this.snapToGrid(draw);
	
	        // When width is less than one, we have to draw to the left
	        // which means we have to move the start-point to the left
	        if (draw.width < 1) {
	            //draw.x = parameters.x + draw.width;
	            draw.x = draw.x + draw.width;
	            draw.width = -draw.width;
	        }
	
	        // ...same with height
	        if (draw.height < 1) {
	            //draw.y = parameters.y + draw.height;
	            draw.y = draw.y + draw.height;
	            draw.height = -draw.height;
	        }
	
	        // draw the element
	        this.el.attr(draw);
	    }

		/*
		** Point is needed when you need multiple "clicks" to define the shape (e.g. polygon)
		point:function(event){

		}
		*/
	}
	
	})(SVG.Element.prototype.draw.plugins)

**Note**: To implement the snapToGrid-feature you can use the function `this.snapToGrid` which takes an array or object and align all members to the grid specified in options. It returns the changed Array/Object