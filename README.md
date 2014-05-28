svg.draw.js
===========

An extension of svn.js which allows to draw elements with mouse

# Usage

As default the drawing starts with a click on the svg-Element


    var draw = SVG('drawing');
    draw.rect().draw();


You can use your own mouse-events. Just pass the event-Object to the draw-Function


    var draw = SVG('drawing');
    var rect = draw.rect();

    draw.on('mousedown', function(event){
        rect.draw(event);
    });
    draw.on('mouseup', function(event){
        rect.draw(event);
    });


# Events

There are 4 events to which you can bind functions

- drawstart
- drawstop
- drawudpdate
- drawpoint

Drawpoint is triggered on shapes like polygons and polylines.

Each event-object holds the relative position to the parent-Object of the Shape (which is mostly the SVG-doc itself) as Array

Binding a function to the Event is easy

    var draw = SVG('drawing');
    draw.rect().draw();
    rect.on('drawstart', function(event){
        console.log(e.detail); // Prints the position [x,y] where drawing started
    });


# Options

There are a few options available you can use. Each option is mostly only for special shapes

- keyDone: For Polygon and Polyline. Finishs the shape (default = 13 = Enter)
- keyCancel: Removes the Shape (default = 27 = escape)

You can set this properties to null, if you want calling this yourself