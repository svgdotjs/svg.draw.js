    SVG.Element.prototype.draw.extend('rect image', {
    
        init:function(e){

            var p = this.startPoint;
            
            this.el.attr({ x: p.x, y: p.y, height: 0, width: 0 });
        },
        
        calc:function (e) {

            var rect = {
                x: this.startPoint.x,
                y: this.startPoint.y
            },  p = this.transformPoint(e.clientX, e.clientY);

            rect.width = p.x - rect.x;
            rect.height = p.y - rect.y;

            // Snap the params to the grid we specified
            this.snapToGrid(rect);

            // When width is less than zero, we have to draw to the left
            // which means we have to move the start-point to the left
            if (rect.width < 0) {
                rect.x = rect.x + rect.width;
                rect.width = -rect.width;
            }

            // ...same with height
            if (rect.height < 0) {
                rect.y = rect.y + rect.height;
                rect.height = -rect.height;
            }

            // draw the element
            this.el.attr(rect);
        }
    
    });
