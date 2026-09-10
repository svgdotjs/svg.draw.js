import '../src/main.js'
import { SVG } from '@svgdotjs/svg.js'

// Test w/ nested
const svg = SVG().addTo('#drawing')

let drawing
let gridSize = 1
let circles = true
let i = 0
const shapes = ['line', 'polyline', 'polygon', 'rect', 'ellipse', 'circle']

function prepareShape() {
  const shape = shapes[i]
  i = (i + 1) % shapes.length

  console.log('Draw ', shape)

  drawing = svg[shape]().draw({
    snapToGrid: gridSize,
    drawCircles: circles
  })

  drawing.stroke('black')
  drawing.fill('none')
  drawing.on('drawstop', () => {
    prepareShape()
  })
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    drawing.draw('done')
  }

  if (e.ctrlKey && e.key === 'z') {
    console.log('Undo')

    drawing.draw('undo')
  }

  if (e.key === 'Escape') {
    console.log('Cancel')

    i = Math.max(i - 1, 0)
    drawing.off('drawstop')
    drawing.draw('cancel')
    prepareShape()
  }

  if (e.key === 'Backspace') {
    console.log('Cancel, previous shape')

    i = Math.max(i - 2, 0)
    drawing.off('drawstop')
    drawing.draw('cancel')
    prepareShape()
  }

  if (e.key === 's') {
    const on = gridSize === 1
    gridSize = on ? 50 : 1
    console.log('Turn grid', on ? 'on' : 'off')

    drawing.draw('param', 'snapToGrid', gridSize)
  }

  if (e.key === 'c') {
    circles = !circles
    console.log('Turn circles', circles ? 'on' : 'off')

    drawing.draw('param', 'drawCircles', circles)
  }
})

prepareShape()
