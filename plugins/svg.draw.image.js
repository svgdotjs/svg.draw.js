//svg.draw.image.js

;(function(plugins){

var draw = {};

plugins.image = {

    init:function(event){

        draw = { x: event.pageX, y: event.pageY, height: 1, width: 1 };
        this.el.attr(draw);
    
    }, 
    
    calc:function(event){
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

}

})(SVG.Element.prototype.draw.plugins)