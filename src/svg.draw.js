;(function () {

    // Calculates the offset of an element
    function offset(el) {
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

    function PaintHandler(el, event, options) {

        var _this = this;

        el.remember('_paintHandler', this);

        this.el = el;
        this.parent = el.parent._parent(SVG.Nested) || el._parent(SVG.Doc);
        this.set = this.parent.set();
        this.parameters = {};
        this.event = event;
        this.plugin = this.getPlugin();
        this.options = {};

        // Merge options and defaults
        for (var i in this.el.draw.defaults) {
            this.options[i] = this.el.draw.defaults[i];
            if (typeof options[i] !== 'undefined') {
                this.options[i] = options[i];
            }
        }
        // When we got an event, we use this for start, otherwise we use the click-event as default
        if (!event) {
            this.parent.on('click.draw', function (e) {
                _this.start(e || window.event);
            });
        }
        /*else {
         this.start(event);
         }*/

    }

    PaintHandler.prototype.start = function (event) {

        this.parameters = { x: event.pageX, y: event.pageY, offset: offset(this.parent) };

        var draw = {}, element = this.el, _this = this;

        // For every element-type we need a different function to calculate the parameters
        // and of course we need different start-conditions
        switch (element.type) {

            // Rectangle
            case 'rect':

                // Set the default parameters for a rectangle and draw it
                draw = { x: event.pageX, y: event.pageY, height: 1, width: 1 };
                element.attr(draw);

                // assign the calc-function which calculates position, width and height
                this.calc = function (event) {
                    draw.x = this.parameters.x;
                    draw.y = this.parameters.y;
                    draw.height = event.pageY - draw.y;
                    draw.width = event.pageX - draw.x;

                    // Correct the Position
                    // the cursor-position is absolute to the html-document but our parent-element is not
                    draw.x -= this.parameters.offset.x;
                    draw.y -= this.parameters.offset.y;

                    // Snap the params to the grid we specified
                    this.snapToGrid(draw);

                    // When width is less than one, we have to draw to the left
                    // which means we have to move the start-point to the left
                    if (draw.width < 1) {
                        draw.x = draw.x + draw.width;
                        draw.width = -draw.width;
                    }

                    // ...same with height
                    if (draw.height < 1) {
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
                this.calc = function (event) {
                    draw.x1 = this.parameters.x - this.parameters.offset.x;
                    draw.y1 = this.parameters.y - this.parameters.offset.y;
                    draw.x2 = event.pageX - this.parameters.offset.x;
                    draw.y2 = event.pageY - this.parameters.offset.y;
                    this.snapToGrid(draw);
                    element.attr(draw);
                };
                break;

            // Polygon and Polyline
            case 'polyline':
            case 'polygon':

                // When we draw a polygon, we immediately need 2 points.
                // One start-point and one point at the mouse-position
                element.array.value[0] = this.snapToGrid([event.pageX - this.parameters.offset.x, event.pageY - this.parameters.offset.y]);
                element.array.value[1] = this.snapToGrid([event.pageX - this.parameters.offset.x, event.pageY - this.parameters.offset.y]);
                element.plot(element.array);

                // We draw little circles around each point
                // This is absolutely not needed and maybe removed in a later release
                this.drawCircles(element.array.value);

                // The calc-function sets the position of the last point to the mouse-position (with offset ofc)
                this.calc = function (event) {
                    element.array.value.pop();
                    if (event) {
                        element.array.value.push(this.snapToGrid([event.pageX - this.parameters.offset.x, event.pageY - this.parameters.offset.y]));
                    }
                    element.plot(element.array);
                };
                break;

            // Circles and Ellipsoid
            case 'ellipse':

                // We start with a circle with radius 1 at the position of the cursor
                draw = { cx: event.pageX, cy: event.pageY, rx: 1, ry: 1 };
                this.snapToGrid(draw);
                element.attr(draw);

                // When using the cursor-position as radius, we can only draw circles
                if (this.options.useRadius) {
                    this.calc = function (event) {
                        draw.cx = this.parameters.x - this.parameters.offset.x;
                        draw.cy = this.parameters.y - this.parameters.offset.y;

                        // calculating the radius
                        draw.rx = draw.ry = Math.sqrt(
                            (event.pageX - this.parameters.x) * (event.pageX - this.parameters.x) +
                                (event.pageY - this.parameters.y) * (event.pageY - this.parameters.y)
                        );
                        this.snapToGrid(draw);
                        element.attr(draw);
                    };
                    // otherwise we threat the cursor-position as width and height of the circle/ellipse
                } else {
                    this.calc = function (event) {
                        draw.cx = this.parameters.x - this.parameters.offset.x;
                        draw.cy = this.parameters.y - this.parameters.offset.y;
                        draw.rx = Math.abs(event.pageX - this.parameters.x);
                        draw.ry = Math.abs(event.pageY - this.parameters.y);
                        this.snapToGrid(draw);
                        element.attr(draw);
                    };
                }
                break;
            // unknown type, try to find a plugin for that type
            default:
                if (this.plugin) {
                    this.plugin.init.call(this, event);
                    this.calc = this.plugin.calc;
                } else {
                    return;
                }
                break;
        }

        // Fire our `drawstart`-event. We send the offset-corrected cursor-position along
        element.fire('drawstart', [event.pageX - this.parameters.offset.x, event.pageY - this.parameters.offset.y]);

        // We need to bind the update-function to the mousemove event to keep track of the cursor
        SVG.on(window, 'mousemove.draw', function (e) {
            _this.update(e || window.event);
        });

        this.start = this.point;


    };

    // This function draws a point if the element is a polyline or polygon
    // Otherwise it will just stop drawing the shape cause we are done    
    PaintHandler.prototype.point = function (event) {

        if (this.plugin && this.plugin.point) {
            this.plugin.point.call(this, event);
            return;
        }

        if (this.el.type.indexOf('poly') > -1) {
            // Add the new Point to the point-array
            var newPoint = [event.pageX - this.parameters.offset.x, event.pageY - this.parameters.offset.y];
            this.el.array.value.push(this.snapToGrid(newPoint));
            this.el.plot(this.el.array);
            this.drawCircles(this.el.array.value);

            // Fire the `drawpoint`-event, which holds the coords of the new Point
            this.el.fire('drawpoint', newPoint);
            return;
        }

        // We are done, if the element is no polyline or polygon
        this.stop(event);
    };


    // The stop-function does the cleanup work
    PaintHandler.prototype.stop = function (event) {
        if (event) {
            this.update(event);
        }

        // Remove all circles
        this.set.each(function () {
            this.remove();
        });

        // Unbind from all events
        SVG.off(window, 'mousemove.draw');
        this.parent.off('click.draw');

        // remove Refernce to PaintHandler
        this.el.forget('_paintHandler');

        // overwrite draw-function since we never need it again for this element
        this.el.draw = function () {
        };

        // Fire the `drawstop`-event
        this.el.fire('drawstop');
    };

    // Updates the element while moving the cursor
    PaintHandler.prototype.update = function (event) {

        // Because we are nice - we give you coords we nowhere need in this function anymore
        var updateParams = [ event.pageX - this.parameters.offset.x,
            event.pageY - this.parameters.offset.y ];

        // Call the calc-function which calculates the new position and size
        this.calc(event);

        // Fire the `drawupdate`-event
        this.el.fire('drawupdate', updateParams);
    };

    // Called from outside. Finishs a poly-element
    PaintHandler.prototype.done = function () {
        this.calc();
        this.stop();

        this.el.fire('drawdone');
    };

    // Called from outside. Cancels a poly-element
    PaintHandler.prototype.cancel = function () {
        // stop drawing and remove the element
        this.stop();
        this.el.remove();

        this.el.fire('drawcancel');
    };

    // Draws circles at the position of the edges from polygon and polyline
    PaintHandler.prototype.drawCircles = function (array) {
        this.set.each(function () {
            this.remove();
        });
        this.set.clear();
        for (var i = 0; i < array.length; ++i) {
            this.set.add(this.parent.circle(5).stroke({width: 1}).fill('#ccc').center(array[i][0], array[i][1]));
        }
    };

    // Calculate the corrected position when using `snapToGrid`
    PaintHandler.prototype.snapToGrid = function (draw) {

        var temp = null;

        // An array was given. Loop through every element
        if (draw.length) {
            temp = [draw[0] % this.options.snapToGrid, draw[1] % this.options.snapToGrid];
            draw[0] -= temp[0] < this.options.snapToGrid / 2 ? temp[0] : temp[0] - this.options.snapToGrid;
            draw[1] -= temp[1] < this.options.snapToGrid / 2 ? temp[1] : temp[1] - this.options.snapToGrid;
            return draw;
        }

        // Properties of element were given. Snap them all
        for (var i in draw) {
            temp = draw[i] % this.options.snapToGrid;
            draw[i] -= (temp < this.options.snapToGrid / 2 ? temp : temp - this.options.snapToGrid) + (temp < 0 ? this.options.snapToGrid : 0);
        }

        return draw;
    };

    PaintHandler.prototype.param = function (key, value) {
        this.options[key] = value === null ? this.el.draw.defaults[key] : value;
    };

    // Returns the plugin
    PaintHandler.prototype.getPlugin = function () {
        return this.el.draw.plugins[this.el.type];
    };

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        draw: function (event, options, value) {

            // sort the parameters
            if (!(event instanceof Event || typeof event === 'string')) {
                options = event;
                event = null;
            }

            // get the old Handler or create a new one from event and options
            var paintHandler = this.remember('_paintHandler') || new PaintHandler(this, event, options || {});

            // When we got an event we have to start/continue drawing
            if (event instanceof Event) {
                paintHandler['start'](event);
            }

            // if event is located in our PaintHandler we handle it as method
            if (paintHandler[event]) {
                paintHandler[event](options, value);
            }

            return this;
        }

    });

    // Default values. Can be changed for the whole project if needed
    SVG.Element.prototype.draw.defaults = {
        useRadius: false,    // If true, we draw the circle using the cursor as radius rather than using it for width and height of the circle
        snapToGrid: 1        // Snaps to a grid of `snapToGrid` px
    };

    // Container for all types not specified here
    SVG.Element.prototype.draw.plugins = {};

}).call(this);