// helpers
const body = document.body

const MathUtils = {
    lineEq: (y2, y1, x2, x1, currentVal) => {
        // y = mx + b
        var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1
        return m * currentVal + b
    },
    lerp: (a, b, n) => (1 - n) * a + n * b,
    getRandomFloat: (min, max) => (Math.random() * (max - min) + min).toFixed(2)
}

const getMousePos = (e) => {
  let posx = 0
  let posy = 0
  if (!e) e = window.event
  if (e.pageX || e.pageY) {
    posx = e.pageX
    posy = e.pageY
  }
  else if (e.clientX || e.clientY) {
    posx = e.clientX + body.scrollLeft + document.documentElement.scrollLeft
    posy = e.clientY + body.scrollTop + document.documentElement.scrollTop
  }
  return { x: posx, y: posy }
}

let winsize
const calcWinSize = () => winsize = { width: window.innerWidth, height: window.innerHeight }
calcWinSize()
window.addEventListener('resize', calcWinSize)

// first position of mouse
let mousepos = { x: winsize.width / 2, y: winsize.height / 2}
// update mouse
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev))

class Drag_1 {
  constructor(el){
    this.strip = el.querySelector('.strip')
    this.items = []
    this.cover = el.querySelector('.strip-cover')
    this.draggable = el.querySelector('.draggable')
    this.draggableWidth = this.draggable.offsetWidth
    this.maxDrag = this.draggableWidth < winsize ? 0 : this.draggableWidth - winsize.width
    this.dragPosition = 0
    this.draggie = new Draggabilly(this.draggable, { axis: 'x'})

    this.init()
    this.initEvents()
  }

  init() {
    this.renderedStyles = {
      position: { previous: 0, current: this.dragPosition },
      scale: { previous: 1, current: 1 },
      imgScale: { previous: 1, current: 1 },
      opacity: { previous: 1, current: 1 },
      coverScale: { previous: 0.75, current: 0.75 },
      coverOpacity: { previous: 0, current: 0 },
    }

    this.render = () => {
      this.renderId = undefined

      for (const key in this.renderedStyles) {
        this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, 0.1)
      }

      // change values
      TweenMax.set(this.strip, { x: this.renderedStyles.position.previous })

      if ( !this.renderId ) {
        this.renderId = requestAnimationFrame(() => this.render())
      }
    }

    this.renderId = requestAnimationFrame( () => this.render())
  }

  initEvents() {
    this.onDragMove = (event, pointer, moveVector) => {
      this.stripOnDragMove()
      mousepos = getMousePos(event)
    }

    this.onDragEnd = () => {
      this.stripOnDragEnd()
    }

    this.draggie.on('dragMove', this.onDragMove)
    this.draggie.on('pointerUp', this.onDragEnd)
  }

  stripOnDragMove() {
    // The possible range for the drag is draggie.position.x = [-maxDrag,0 ]
    if (this.draggie.position.x >= 0) {
      // the max we will be able to drag is winsize.width/2
      this.dragPosition = MathUtils.lineEq( 0.5 * winsize.width, 0, winsize.width, 0, this.draggie.position.x)
    } else if ( this.draggie.position.x < -1 * this.maxDrag) {
      // the max we will be able to drag is winsize.width/2
      this.dragPosition = MathUtils.lineEq( 0.5 * winsize.width, 0, this.maxDrag + winsize.width, this.maxDrag, this.draggie.position.x)
    } else {
      this.dragPosition = this.draggie.position.x
    }
    this.renderedStyles.position.current = this.dragPosition
  }

  stripOnDragEnd() {
    if (this.draggie.position.x > 0) {
      this.dragPosition = 0
      this.draggie.setPosition(this.dragPosition, this.draggie.position.y)
    } else if ( this.draggie.position.x < -1 * this.maxDrag ) {
      this.dragPosition =  -1 * this.maxDrag
      this.draggie.setPosition(this.dragPosition, this.draggie.position.y)
    }
    this.renderedStyles.position.current = this.dragPosition
  }


} export default Drag_1
