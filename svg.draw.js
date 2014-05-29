// svg.draw.js 0.0.5 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Urich-Matthias Schäfer (https://github.com/Fuzzyma)

// TODO: call cancel and done from out of the plugin

;(function() {

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        draw: function(event, options) {

            var start, stop, point, update, done, cancel, drawCircles, defaults
                , element = this
                , draw = {}
                , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)
                , set = parent.set();

            defaults = {
                useRadius:false,
                keyDone:13,
                keyCancel:27
            };

            if(this.calc === null)return element;  // This element was already drawn. You cant draw an element twice. Instead create a new one!

            this.startParams = this.startParams || {};

            start = function(event){

                event = event || window.event;

                if(element.calc){
                    point(event);
                    return element;
                }

                element.startParams = { x:event.pageX, y: event.pageY, offset:offset(parent) };

                SVG.on(window, 'keydown', cancel);

                switch(element.type){
                    case 'rect':
                        draw = { x:event.pageX, y: event.pageY, height:1, width:1 };
                        element.attr(draw);

                        element.calc = function(event){
                            draw.x = element.startParams.x;
                            draw.y = element.startParams.y;
                            draw.height = event.pageY - draw.y;
                            draw.width = event.pageX - draw.x;


                            if(draw.width < 1){
                                draw.x = element.startParams.x + draw.width;
                                draw.width = -draw.width;
                            }

                            if(draw.height < 1){
                                draw.y = element.startParams.y + draw.height;
                                draw.height = -draw.height;
                            }

                            // Correcting the Position (absolute position of the element has to be kept in mind)
                            draw.x -= element.startParams.offset.x;
                            draw.y -= element.startParams.offset.y;
                            element.attr(draw);
                        };
                        break;
                    case 'line':
                        element.calc = function(event){
                            draw.x1 = element.startParams.x - element.startParams.offset.x;
                            draw.y1 = element.startParams.y - element.startParams.offset.y;
                            draw.x2 = event.pageX - element.startParams.offset.x;
                            draw.y2 = event.pageY - element.startParams.offset.y;
                            element.attr(draw);
                        };
                        break;
                    case 'polyline':
                    case 'polygon':

                        SVG.on(window, 'keydown', done);

                        element.array.value[0] = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y];
                        element.array.value[1] = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y];
                        element.plot(element.array);

                        drawCircles(element.array.value);   // TODO: Just gimmick for now, maybe needed later

                        element.calc = function(event){
                            element.array.value.pop();
                            if(event)element.array.value.push([event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y]);
                            element.plot(element.array);
                        };
                        break;
                    case 'ellipse':

                        draw = { cx:event.pageX, cy: event.pageY, rx:1, ry:1 };
                        element.attr(draw);

                        if(defaults.useRadius)
                            element.calc = function(event){
                                draw.cx = element.startParams.x - element.startParams.offset.x;
                                draw.cy = element.startParams.y - element.startParams.offset.y;
                                draw.rx = draw.ry = Math.sqrt(
                                    (event.pageX - element.startParams.x) * (event.pageX - element.startParams.x) +
                                    (event.pageY - element.startParams.y) * (event.pageY - element.startParams.y)
                                );
                                element.attr(draw);
                            };
                        else
                            element.calc = function(event){
                                draw.cx = element.startParams.x - element.startParams.offset.x;
                                draw.cy = element.startParams.y - element.startParams.offset.y;
                                draw.rx = Math.abs(event.pageX - element.startParams.x);
                                draw.ry = Math.abs(event.pageY - element.startParams.y);
                                element.attr(draw);
                            };
                        break;
                }


                element.node.dispatchEvent(new CustomEvent('drawstart', {detail:[event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y]}));

                SVG.on(window, 'mousemove', function(event){update(event); element.moveHandler = arguments.callee});
                return element;
            };


            stop = function(event){
                if(event)update(event);

                set.each(function(){ this.remove(); });

                SVG.off(window, 'mousemove', element.moveHandler);
                SVG.off(window, 'keydown', done);
                SVG.off(window, 'keydown', cancel);
                parent.off('click', start);
                element.calc = null;
                delete element.startParams;
                delete element.moveHandler;

                element.node.dispatchEvent(new CustomEvent('drawstop', {detail:draw}));
                return element;
            };

            point = function(event){
                if(element.type == 'polyline' || element.type == 'polygon'){
                    var newPoint = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y];
                    element.array.value.push(newPoint);
                    element.plot(element.array);
                    drawCircles(element.array.value);

                    draw = element.array.value;
                    element.node.dispatchEvent(new CustomEvent('drawpoint', {detail:newPoint}));
                    return element;
                }

                stop(event);
                return element;
            };

            update = function(event){
                event = event || window.event;

                var updateParams = [ event.pageX - element.startParams.offset.x,
                    event.pageY - element.startParams.offset.y ];

                element.calc(event);
                element.node.dispatchEvent(new CustomEvent('drawupdate',{detail:updateParams}));
                return element;
            };

            done = function(event){
                if(event && event.keyCode !== defaults.keyDone)return;
                element.calc();
                stop();
            }

            cancel = function(event){
                if(event && event.keyCode !== defaults.keyCancel)return;
                stop();
                element.remove();
            }

            drawCircles = function(array){
                set.each(function(){ this.remove(); });
                set.clear();
                for(var i = 0; i<array.length; ++i){
                    set.add( parent.circle(5).stroke({width:1}).fill('#ccc').center(array[i][0], array[i][1]) );
                }
            };

            function offset(el){
                var x = 0, y = 0;

                if('doc' in el){
                    var box = el.bbox();
                    x = box.x;
                    y = box.y;
                    el = el.doc().parent;
                }

                while(el.nodeName.toUpperCase() !== 'BODY'){
                    x += el.offsetLeft;
                    y += el.offsetTop;
                    el = el.offsetParent;
                }

                return {x:x,y:y};
            }

            if(!(event instanceof Event)){
                options = event;
                event = null;
            }

            for(var i in options){
                defaults[i] = options[i];
            }

            if(!event)parent.on('click', start);
            else start(event);

            return this;
        }

    })

}).call(this);