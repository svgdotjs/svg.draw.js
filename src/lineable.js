export const lineable = {
  NAME: 'line polyline polygon',

  init: function () {
    // When we draw a polygon, we immediately need 2 points.
    // One start-point and one point at the mouse-position

    this.set = []

    var p = this.startPoint
    var arr = [
      [p.x, p.y],
      [p.x, p.y],
    ]

    this.el.plot(arr)

    // We draw little circles around each point
    // This can be disabled by setting { drawCircles: false } option
    if (this.options.drawCircles) {
      this.drawCircles()
    }
  },

  // The calc-function sets the position of the last point to the mouse-position (with offset ofc)
  calc: function (e) {
    var arr = this.el.array().valueOf()
    arr.pop()

    if (e) {
      var p = this.transformPoint(e.clientX, e.clientY)
      arr.push(this.snapToGrid([p.x, p.y]))
    }

    this.el.plot(arr)

    if (this.options.drawCircles) {
      this.drawCircles()
    } else {
      this.set.forEach((e) => e.remove())
      this.set = []
    }
  },

  point: function (e) {
    if (this.el.type.indexOf('poly') > -1) {
      // Add the new Point to the point-array
      var p = this.transformPoint(e.clientX, e.clientY)
      var arr = this.el.array().valueOf()

      arr.push(this.snapToGrid([p.x, p.y]))

      this.el.plot(arr)

      if (this.options.drawCircles) {
        this.drawCircles()
      }

      // Fire the `drawpoint`-event, which holds the coords of the new Point
      this.el.fire('drawpoint', { event: e, p: { x: p.x, y: p.y }, m: this.m })

      return
    }

    // We are done, if the element is no polyline or polygon
    this.stop(e)
  },

  clean: function () {
    // Remove all circles
    this.set.forEach((e) => e.remove())
    this.set = []
    delete this.set
  },

  drawCircles: function () {
    var array = this.el.array().valueOf()

    this.set.forEach((e) => e.remove())
    this.set = []

    for (var i = 0; i < array.length; ++i) {
      this.p.x = array[i][0]
      this.p.y = array[i][1]

      var p = this.p.matrixTransform(this.parent.node.getScreenCTM().inverse().multiply(this.el.node.getScreenCTM()))

      this.set.push(this.parent.circle(5).stroke({ width: 1 }).fill('#ccc').center(p.x, p.y))
    }
  },

  undo: function () {
    if (this.set.length) {
      this.set.splice(-2, 1)[0].remove()
      this.el.array().splice(-2, 1)
      this.el.plot(this.el.array())
      this.el.fire('undopoint')
    }
  },
}
