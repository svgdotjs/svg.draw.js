svg.draw.js
===========

An extension of svn.js which allows to draw elements with mouse

# Usage

As default the drawing starts with a click on the svg-Element


    var draw = SVG('drawing');
    draw.rect().draw();


You can use your own mouse-events. Just pass the event-Object to the draw-Function


    var draw = SVG('drawing');
    var rect = SVG.rect();

    draw.on('mousedown', function(event){
        rect.draw(event);
    });
    draw.on('mouseup', function(event){
        rect.draw(event);
    });


*Till now this works only with the rect-function. Stay tuned for further updates*