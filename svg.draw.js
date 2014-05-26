// svg.draw.js 0.0.1 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Urich-Matthias Schäfer (https://github.com/Fuzzyma)
var update;

;(function() {

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        draw: function(event) {

            var start, /*update,*/ stop
                , element = this
                , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)

            this.start = function(event){
                if(element.startPose){element.stop(event); return element;}

                event = event || window.event;
                element.startPose = { x:event.pageX, y: event.pageY };

                element.drawParams = { x:event.pageX, y: event.pageY, height:1, width:1, fill:'#ddd' }

                element.attr( element.drawParams );

                element.update = update;    // Without this the handler cant be removed cause the update-funktion this funktion sees is nother as the one in the stop-function
                SVG.on(window, 'mousemove', element.update);
                return element;
            }

            this.stop = function(event){
                console.log(event);
                update(event);
                element.startPose = null;
                SVG.off(window, 'mousemove', element.update);
                parent.off('click', start);
                return element;
            }

            update = function(event){
                event = event || window.event;

                element.drawParams.x = element.startPose.x;
                element.drawParams.y = element.startPose.y;
                element.drawParams.height = event.pageY - element.drawParams.y;
                element.drawParams.width = event.pageX - element.drawParams.x;


                if(element.drawParams.width < 1){
                    element.drawParams.x = element.startPose.x + element.drawParams.width;
                    element.drawParams.width = -element.drawParams.width;
                }

                if(element.drawParams.height < 1){
                    element.drawParams.y = element.startPose.y + element.drawParams.height;
                    element.drawParams.height = -element.drawParams.height;
                }

                element.attr(element.drawParams);
                return element;
            }

            if(!event)parent.on('click', this.start);
            else this.start(event);

            return this;
        }

    })

}).call(this);