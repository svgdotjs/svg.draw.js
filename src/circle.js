    SVG.Element.prototype.draw.extend('circle', {
    
        init:function(e){
        
            var p = this.startPoint;

            this.el.attr({ cx: p.x, cy: p.y, r: 1 });
        },

        // We determine the radius by the cursor position
        calc:function (e) {
            
            var p = this.transformPoint(e.clientX, e.clientY),
                circle = {
                    cx: this.startPoint.x,
                    cy: this.startPoint.y,

                    // calculating the radius
                    r: Math.sqrt(
                        (p.x - this.startPoint.x) * (p.x - this.startPoint.x) +
                        (p.y - this.startPoint.y) * (p.y - this.startPoint.y)
                    )
            };
            
            this.snapToGrid(circle);
            this.el.attr(circle);
        }
        
    });