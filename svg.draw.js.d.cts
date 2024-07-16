// Type definitions for @svgdotjs version 3.x
// Project: @svgdotjs/svg.draw.js

declare module '@svgdotjs/svg.js' {
  interface DrawOptions {
    snapToGrid?: number
    drawCircles?: boolean
  }

  type DrawMethod = 'done' | 'cancel' | 'undo' | 'stop' | 'point' | 'update'

  interface DrawEvent {
    detail: {
      event: Event
      p: SVGPoint
      m: DOMMatrix
    }
  }

  interface SVGDotJsEventMap {
    drawstart: DrawEvent
    drawstop: Event
    drawupdate: DrawEvent
    drawpoint: DrawEvent
    drawdone: Event
    drawcancel: Event
  }

  export interface Element {
    draw(event?: Event, options?: DrawOptions): Element

    /** Begin drawing with the provided `DrawOptions` */
    draw(options?: DrawOptions): Element

    /**
     * Call a built-in method
     *
     * @example
     * // Finishes the poly-shape
     * polygon.draw('done');
     *
     * // Cancels drawing of a shape, removes it
     * polygon.draw('cancel');
     *
     * // The following are only useful in edge-cases
     *
     * // Draws a new point with the help of a (mouse) event
     * polygon.draw('point', event)
     *
     * // Draws the point while moving the mouse (basically the animation)
     * polygon.draw('update', evnt)
     *
     * // Stop drawing, cleans up
     * polygon.draw('stop', event)
     */
    draw(method: DrawMethod, event?: Event): Element

    /** Update options for a drawing in progress */
    draw(method: 'param', key: any, value: any): Element

    /** Call a method by name. May be used when drawing custom shapes. */
    draw(method: string): Element
  }
}
