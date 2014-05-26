// svg.draw.js 0.0.1 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Urich-Matthias Schäfer (https://github.com/Fuzzyma)

;(function() {

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        draw: function(event) {

            console.log(this.type);

            var start, update, stop, calc
                , element = this
                , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)


            this.start = function(event){

                if(element.startParams){element.stop(event); return element;}

                element.startParams = { x:event.pageX, y: event.pageY, offset:offset(parent) };
                element.drawParams = {};

                switch(this.type){
                    case 'rect':
                        element.drawParams = { x:event.pageX, y: event.pageY, height:1, width:1 }

                        calc = function(event){
                            element.drawParams.x = element.startParams.x;
                            element.drawParams.y = element.startParams.y;
                            element.drawParams.height = event.pageY - element.drawParams.y;
                            element.drawParams.width = event.pageX - element.drawParams.x;


                            if(element.drawParams.width < 1){
                                element.drawParams.x = element.startParams.x + element.drawParams.width;
                                element.drawParams.width = -element.drawParams.width;
                            }

                            if(element.drawParams.height < 1){
                                element.drawParams.y = element.startParams.y + element.drawParams.height;
                                element.drawParams.height = -element.drawParams.height;
                            }

                            // Correcting the Position (absolute position of the element has to be kept in mind)
                            element.drawParams.x -= element.startParams.offset.x;
                            element.drawParams.y -= element.startParams.offset.y;
                            element.attr(element.drawParams);
                        }
                        break;
                    case 'line':
                        calc = function(event){
                            element.drawParams.x1 = element.startParams.x - element.startParams.offset.x;
                            element.drawParams.y1 = element.startParams.y - element.startParams.offset.y;
                            element.drawParams.x2 = event.pageX - element.startParams.offset.x;
                            element.drawParams.y2 = event.pageY - element.startParams.offset.y;
                            element.attr(element.drawParams);
                        }
                        break;
                    case 'polyline':
                    case 'polygon':
                        console.log(element);

                        element.array.value[0] = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y];
                        element.array.value[1] = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y];
                        console.log(element);
                        element.plot(element.array);

                        calc = function(event){
                            element.array.value.pop();
                            element.array.value.push([event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y]);
                            element.plot(element.array);
                        }
                        break;
                }

                event = event || window.event;


                element.update = update;    // Without this the handler cant be removed cause the update-function this function sees is another than the one in the stop-function
                SVG.on(window, 'mousemove', element.update);
                return element;
            }

            this.stop = function(event){

                if(element.type == 'polyline' || element.type == 'polygon'){
                    element.array.value.push([event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y]);
                    element.array.value.push([element.array.length] = [event.pageX - element.startParams.offset.x, event.pageY - element.startParams.offset.y]);
                    element.plot(element.array);
                    return element;
                }

                update(event);
                element.startParams = null;
                SVG.off(window, 'mousemove', element.update);
                parent.off('click', element.saveHandler);
                return element;
            }

            update = function(event){
                event = event || window.event;

                /*element.drawParams.x = element.startParams.x;
                element.drawParams.y = element.startParams.y;
                element.drawParams.height = event.pageY - element.drawParams.y;
                element.drawParams.width = event.pageX - element.drawParams.x;


                if(element.drawParams.width < 1){
                    element.drawParams.x = element.startParams.x + element.drawParams.width;
                    element.drawParams.width = -element.drawParams.width;
                }

                if(element.drawParams.height < 1){
                    element.drawParams.y = element.startParams.y + element.drawParams.height;
                    element.drawParams.height = -element.drawParams.height;
                }
                */
                calc(event);
                //element.attr(element.drawParams);
                return element;
            }

            function offset(el){
                var x = 0, y = 0;
                //var el = 'doc' in el ? el.doc().parent : el;
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
                console.log(x,y);
                return {x:x,y:y};
            }

            if(!event)parent.on('click', function(event){ element.start(event); element.saveHandler = arguments.callee; });
            else this.start(event);

            return this;
        }

    })

}).call(this);