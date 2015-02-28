// svg.draw.js 0.1.0 - Release for svg.js 1.0.0-rc.9 - Copyright (c) 2014 Ulrich-Matthias Schäfer - Licensed under the MIT license

// TODO: call cancel and done from out of the plugin

;(function () {

    // Only one Element can be drawn at the same time so we don't have to save stuff on the element itself
    var parameters = {};
    var drawing = false;
    var offset, snapToGrid, calc;

    // Calculates the offset of an element
    offset = function (el) {
        var x = 0, y = 0;

        if ('doc' in el) {
            var box = el.bbox();
            x = box.x;
            y = box.y;
            el = el.doc().parent;
        }

        while (el.nodeName.toUpperCase() !== 'BODY') {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }

        return {x: x, y: y};
    }
    
    // Calculate the corrected position when using `snapToGrid`
    snapToGrid = function (draw) {

        // An array was given. Loop through every element
        if (draw.length) {
            var temp = [draw[0] % defaults.snapToGrid, draw[1] % defaults.snapToGrid];
            draw[0] -= temp[0] < defaults.snapToGrid / 2 ? temp[0] : temp[0] - defaults.snapToGrid;
            draw[1] -= temp[1] < defaults.snapToGrid / 2 ? temp[1] : temp[1] - defaults.snapToGrid;
            return draw;
        }

        // Properties of element were given. Snap them all
        for (var i in draw) {
            var temp = draw[i] % defaults.snapToGrid;
            draw[i] -= (temp < defaults.snapToGrid / 2 ? temp : temp - defaults.snapToGrid) + (temp < 0 ? defaults.snapToGrid : 0);
        }

        return draw;
    };
    
    // Draws circles at the position of the edges from polygon and polyline
    drawCircles = function (array) {
        set.each(function () {
            this.remove();
        });
        set.clear();
        for (var i = 0; i < array.length; ++i) {
            set.add(parent.circle(5).stroke({width: 1}).fill('#ccc').center(array[i][0], array[i][1]));
        }
    };

    var methods = {
    
        start = function (event) {
            event = event || window.event;
            parameters = { x: event.pageX, y: event.pageY, offset: offset(parent) };
            drawing = true;
            
            // For every element-type we need a different function to calculate the parameters
            // and of course we need different start-conditions
            switch (element.type) {

                // Rectangle
                case 'rect':

                    // Set the default parameters for a rectangle and draw it
                    draw = { x: event.pageX, y: event.pageY, height: 1, width: 1 };
                    element.attr(draw);

                    // assign the calc-function which calculates position, width and height
                    calc = function (event) {
                        draw.x = parameters.x;
                        draw.y = parameters.y;
                        draw.height = event.pageY - draw.y;
                        draw.width = event.pageX - draw.x;

                        // Correct the Position
                        // the cursor-position is absolute to the html-document but our parent-element is not
                        draw.x -= parameters.offset.x;
                        draw.y -= parameters.offset.y;

                        // Snap the params to the grid we specified
                        snapToGrid(draw);

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
                        element.attr(draw);
                    };
                    break;

                // Line
                case 'line':
                    // s.a.
                    calc = function (event) {
                        draw.x1 = parameters.x - parameters.offset.x;
                        draw.y1 = parameters.y - parameters.offset.y;
                        draw.x2 = event.pageX - parameters.offset.x;
                        draw.y2 = event.pageY - parameters.offset.y;
                        snapToGrid(draw);
                        element.attr(draw);
                    };
                    break;

                // Polygon and Polyline
                case 'polyline':
                case 'polygon':

                    // Bind the done-function to our done-key
                    SVG.on(window, 'keydown', done);

                    // When we draw a polygon, we immediately need 2 points.
                    // One start-point and one point at the mouse-position
                    element.array.value[0] = snapToGrid([event.pageX - parameters.offset.x, event.pageY - parameters.offset.y]);
                    element.array.value[1] = snapToGrid([event.pageX - parameters.offset.x, event.pageY - parameters.offset.y]);
                    element.plot(element.array);

                    // We draw little circles around each point
                    // This is absolutely not needed and maybe removed in a later release
                    drawCircles(element.array.value);

                    // The calc-function sets the position of the last point to the mouse-position (with offset ofc)
                    calc = function (event) {
                        element.array.value.pop();
                        if (event)element.array.value.push(snapToGrid([event.pageX - parameters.offset.x, event.pageY - parameters.offset.y]));
                        element.plot(element.array);
                    };
                    break;

                // Circles and Ellipsoid
                case 'ellipse':

                    // We start with a circle with radius 1 at the position of the cursor
                    draw = { cx: event.pageX, cy: event.pageY, rx: 1, ry: 1 };
                    snapToGrid(draw);
                    element.attr(draw);

                    // When using the cursor-position as radius, we can only draw circles
                    if (defaults.useRadius)
                        calc = function (event) {
                            draw.cx = parameters.x - parameters.offset.x;
                            draw.cy = parameters.y - parameters.offset.y;

                            // calculating the radius
                            draw.rx = draw.ry = Math.sqrt(
                                (event.pageX - parameters.x) * (event.pageX - parameters.x) +
                                    (event.pageY - parameters.y) * (event.pageY - parameters.y)
                            );
                            snapToGrid(draw);
                            element.attr(draw);
                        };
                    // otherwise we threat the cursor-position as width and height of the circle/ellipse
                    else
                        calc = function (event) {
                            draw.cx = parameters.x - parameters.offset.x;
                            draw.cy = parameters.y - parameters.offset.y;
                            draw.rx = Math.abs(event.pageX - parameters.x);
                            draw.ry = Math.abs(event.pageY - parameters.y);
                            snapToGrid(draw);
                            element.attr(draw);
                        };

                    break;
            }

            // Fire our `drawstart`-event. We send the offset-corrected cursor-position along
            element.fire('drawstart', [event.pageX - parameters.offset.x, event.pageY - parameters.offset.y]);

            // We need to bind the update-function to the mousemove event to keep track of the cursor
            SVG.on(window, 'mousemove', function (event) {
                update(event);
                element.moveHandler = arguments.callee
            });
            
        }
    
        // This function draws a point if the element is a polyline or polygon
        // Otherwise it will just stop drawing the shape cause we are done
        point = function (event) {

            if (element.type.indexOf('poly') > -1) {
                // Add the new Point to the point-array
                var newPoint = [event.pageX - parameters.offset.x, event.pageY - parameters.offset.y];
                element.array.value.push(snapToGrid(newPoint));
                element.plot(element.array);
                drawCircles(element.array.value);

                draw = element.array.value;

                // Fire the `drawpoint`-event, which holds the coords of the new Point
                element.node.dispatchEvent(new CustomEvent('drawpoint', {detail: newPoint}));
                return;
            }

            // We are done, if the element is no polyline or polygon
            stop(event);
        };

        // The stop-function does the cleanup work
        stop = function (event) {
            if (event)update(event);

            // Remove all circles
            set.each(function () {
                this.remove();
            });

            // Unbind from all events
            SVG.off(window, 'mousemove', element.moveHandler);

            // Cleanup our data
            element.calc = null;
            delete parameters;
            delete element.moveHandler;

            // Fire the `drawstop`-event
            element.trigger('drawstop', draw);
        };

        // Updates the element while moving the cursor
        update = function (event) {
            event = event || window.event;

            var updateParams = [ event.pageX - parameters.offset.x,
                event.pageY - parameters.offset.y ];

            // Call the calc-function which calculates the new position and size
            element.calc(event);

            // Fire the `drawupdate`-event
            element.trigger('drawupdate', updateParams);
        };

        // Called, when the done-key is pressed.
        // Only bind when drawing polygon or polyline
        done = function (event) {
            event = event || window.event;
            element.calc();
            stop();
        };

        // Called when the cancel-key is pressed
        cancel = function (event) {
            // stop drawing and remove the element
            stop();
            element.remove();
        };

    }

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        draw: function (method, options) {

            var start, stop, point, update, done, cancel, drawCircles, snapToGrid, defaults
                , element = this
                , draw = {}
                , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)
                , set = parent.set();

            // Default values for the options
            defaults = {
                useRadius: false,    // If true, we draw the circle using the cursor as radius rather than using it for width and height of the circle
                keyDone: 13,         // The key which should be pressed for finishing the shape. Needed for polygon and polyline.
                keyCancel: 27,       // The key which should be pressed for canceling
                snapToGrid: 1        // Snaps to a grid of `snapToGrid` px
            };

            if(!methods[method]){
                options = method;
            }
            
            // Sort the parameter given to the function
            if (!(event instanceof Event)) {
                options = event;
                event = null;
            }

            // Merging the defaults and the options-object together
            for (var i in options) {
                if (!defaults.hasOwnProperty(i))throw('Property ' + i + ' doesn\'t exists');
                defaults[i] = options[i];
            }

            // When we got an event, we use this for start, otherwise we use the click-event as default
            if (!event)parent.on('click', start);
            else start(event);

            return this;
        }

    })

}).call(this);