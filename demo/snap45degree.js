// @ts-check

'use strict'

function degree452 () {
    var ENTER = 13
    // @ts-ignore
    var canvas = new SVG('degree45')
    var polyline = canvas.polyline().fill('none').stroke({
        width: 2
    })
    var circle // circle to display where angle is calculated
    var realLine // line to display the real line to the mouse point
    var update = true // semiphore to
    var startPoint, matrix
    var snappedPoint

    canvas.on('dblclick', function (event) {
        printXY(event)

        if (snappedPoint) {
            event = new CustomEvent('MouseEvent')
            event.clientX = snappedPoint.clientX
            event.clientY = snappedPoint.clientY
        }

        polyline.draw('point', event)

        if (realLine) realLine.remove()

        realLine = canvas
            .line()
            .stroke({
                width: 1,
                color: 'rgb(255, 0, 0)'
            })
            .opacity(.4)
    })

    canvas.on('mousemove', function () {
        update = true
    })

    polyline.on('drawstart', function (event) {
        startPoint = event.detail.p.clone()
        matrix = event.detail.m

        circle = createCircle(canvas, startPoint)

        document.addEventListener('keydown', function exit (event) {
            if (event.keyCode === ENTER) {
                circle.remove()
                realLine.remove()
                polyline.draw('done')
                polyline.off()
                canvas.off()
                document.removeEventListener('keydown', exit)
            }
        })
    })

    polyline.on('drawpoint', function (event) {
        // console.log('drawpoint')
        printXY(event.detail.event)
        startPoint = event.detail.p.clone()
        circle.remove()
        circle = createCircle(canvas, startPoint)
    })

    polyline.on('drawupdate', function (event) {
        // console.log('drawupdate')

        if (update) {
            var p = event.detail.p
            realLine.plot(startPoint.x, startPoint.y, p.x, p.y)

            var d = distance(startPoint, p)
            circle.radius(d)

            // debugger
            var sp = snapTo45(startPoint, p)
                .transform(matrix.inverse())

            var emulatedMouseEvent = {
                clientX: sp.x,
                clientY: sp.y
            }

            printXY(emulatedMouseEvent)
            snappedPoint = emulatedMouseEvent

            update = false
            polyline.draw('update', emulatedMouseEvent)
        }
    })

    function printXY(obj) {
        // console.log(obj.clientX, obj.clientY)
    }

    function createCircle(canvas, point) {
        var diameter = 20
        var circle = canvas
            .circle(diameter)
            .stroke({
                width: 1,
                dasharray: '4 10'
            })
            .fill("none")
            .move(point.x - diameter / 2, point.y - diameter / 2)

        return circle
    }

    function distance(v1, v2) {
        if (typeof v1 === "number") return distanceOfNumbers(v1, v2)
        return distanceOfVectors(v1, v2)
    }

    function distanceOfVectors(vector1, vector2) {
        return distanceOfNumbers(subX(vector1, vector2), subY(vector1, vector2))
    }

    function distanceOfNumbers(n1, n2) {
        return Math.sqrt(Math.pow(n1, 2) + Math.pow(n2, 2))
    }

    function subX(v1, v2) {
        return v1.x - v2.x
    }

    function subY(v1, v2) {
        return v1.y - v2.y
    }

    function snapTo45(startPoint, currentPoint) {
        // solution from https://stackoverflow.com/a/42510911/205696
        var deltaX = subX(currentPoint, startPoint),
            deltaY = subY(currentPoint, startPoint),
            dist = distance(deltaX, deltaY)

        var angle = Math.atan2(deltaY, deltaX)
        // var snappedAngle = (angle / Math.PI * 4) / 4 * Math.PI
        var snappedAngle = Math.round(angle / Math.PI * 4) / 4 * Math.PI
        // console.log(snappedAngle)

        // console.log(deltaX, deltaY, dist, angle, snappedAngle)
        // console.log(startPoint, currentPoint)
        // console.log(dist)

        // return {
        //   clientX: startPoint.x + dist * Math.cos(snappedAngle),
        //   clientY: startPoint.y + dist * Math.sin(snappedAngle)
        // }

        // @ts-ignore
        return new SVG.Point(
            startPoint.x + dist * Math.cos(snappedAngle),
            startPoint.y + dist * Math.sin(snappedAngle)
        )
    }

    // function transformPoint (point, matrix) {
    //   this.p.x = x - (this.offset.x - window.pageXOffset)
    //   this.p.y = y - (this.offset.y - window.pageYOffset)

    //   return this.p.transform(this.m)
    // }
}