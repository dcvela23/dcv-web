import { addClass } from './../utils/classes.js'

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
 return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

class Image3_1 {
  constructor(el, options = {}){
    this.container = document.body;
    this.itemsWrapper = el.querySelector('ul')
    // setUp the effect: scene, items, textures, mouse
    if (!this.container || !this.itemsWrapper) return
    this.setup()
    this.initEffectShell().then(() => {
      this.isLoaded = true
    })
    // create geomtetry with material and shader
    options.strength = options.strengh || 0.25
    options.amount = options.amount || 5
    options.duration = options.duration || 0.5
    this.options = options
    this.init()
    // add events and interactions: texture, position, opacity distorsion
    this.createEventListeners()
  }

  // create the scene
  get viewport() {
    let width = this.container.clientWidth
    let height = this.container.clientHeight
    let aspectRatio = width / height

    return {
      width,
      height,
      aspectRatio
    }
  }

  setup() {
    //  renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio = window.devicePixelRatio
    this.container.querySelector('#imag3-1').appendChild(this.renderer.domElement)

    // scene
    this.scene = new THREE.Scene()

    // camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.viewport.aspectRatio,
      0.1,
      100
    )
    this.camera.position.set(0, 0, 3)

    //
    this.mouse = new THREE.Vector2()

    // animation loop
    this.renderer.setAnimationLoop(this.render.bind(this))
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = this.viewport.aspectRatio
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height)
  }

  // get item lements and load textures
  get itemsElements() {
    const items = [...this.itemsWrapper.querySelectorAll('li')]

    return items.map((item, index) => ({
      element: item,
      img: item.querySelector('img') || null,
      index: index
    }))
  }

  loadTexture(loader, url, index) {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({texture: null, index})
        return
      }
      //load a resource
      loader.load(
        // resource Url
        url,
        // onLoad callback
        texture => {
          resolve({ texture, index})
        },
        // onProgress callback currently not supported
        undefined,
        // onErrorCallback
        error => {
          console.log('An error happened', error)
          reject(error)
        }
      )
    })
  }

  initEffectShell() {
     // It’s an asynchronous operation so we shouldn’t initialize the effect without
     // all textures being loaded. Otherwise our texture will be fully black.

     let promises = []
     this.items = this.itemsElements

     const THREEtextureLoader = new THREE.TextureLoader()
     this.items.forEach((item, index) => {
       // create textures
       promises.push(
         this.loadTexture(
           THREEtextureLoader,
           item.img ? item.img.src : null,
           index
         )
       )
     })

     return new Promise( (resolve, reject) => {
       // resolve textures promises
       Promise.all(promises).then(promises => {
         // all textures are loaded
         promises.forEach( (promise, index) => {
           // asign texture to item
           this.items[index].texture = promise.texture
         })
         resolve()
       })
     })
  }

  // create the material, the geometry and the shader
  init() {
    this.position = new THREE.Vector3(0,0,0)
    this.scale = new THREE.Vector3(1,1,1)
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
    // geometry config
    this.uniforms = {
      uTexture: {
        // texture data
        value: null
      },
      uOffset: {
        //distorsion strengh
        value: new THREE.Vector2(0.0, 0.0)
      },
      uAlpha: {
        // opacity
        value: 0
      }
    }
    this.material = new THREE.ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: `
       uniform vec2 uOffset;
       varying vec2 vUv;

       #define M_PI 3.1415926535897932384626433832795

       vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
         position.x = position.x + (sin(uv.y * M_PI) * offset.x);
         position.y = position.y + (sin(uv.x * M_PI) * offset.y);
         return position;
       }

       void main() {
         vUv = uv;
         vec3 newPosition = deformationCurve(position, uv, uOffset);
         gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
       }
     `,
     fragmentShader: `
       uniform sampler2D uTexture;
       uniform float uAlpha;
       varying vec2 vUv;

       void main() {
         vec3 color = texture2D(uTexture,vUv).rgb;
         gl_FragColor = vec4(color,uAlpha);
       }
     `,
     transparent: true
    })

    this.plane = new THREE.Mesh(this.geometry, this.material)

    // only one plane
    //this.scene.add(this.plane)

    // several plane
    this.trails = []
    for (let i = 0; i < this.options.amount; i++) {
      let plane = this.plane.clone()
      this.trails.push(plane)
      this.scene.add(plane)
    }

  }

  // create the events: update texture, position, opacity and distorsion
  createEventListeners(){
    // items
    this.items.forEach((item, index) => {
        item.element.addEventListener(
          'mouseover',
          this._onMouseOver.bind(this, index),
          false
        )
    })
    // container
    this.container.addEventListener(
      'mousemove',
      this._onMouseMove.bind(this),
      this
    )
    // itemsWrapper
    this.itemsWrapper.addEventListener(
      'mouseleave',
      this._onMouseLeave.bind(this),
      false
    )
  }

  _onMouseLeave(event) {
    this.isMouseOver = false
    this.onMouseLeave(event)
  }

  _onMouseMove(event) {
    // get normalized mouse position on viewport
    this.mouse.x = (event.clientX / this.viewport.width) * 2 - 1
    this.mouse.y = -(event.clientY / this.viewport.height) * 2 + 1

    this.onMouseMove(event)
  }

  _onMouseOver(index, event) {
    this.onMouseOver(index, event)
  }

  // update texture
  onMouseOver(index, e) {
    if (!this.isLoaded) return
    this.onMouseEnter()
    if (this.currentItem && this.currentItem.index === index) return
    this.onTargetChange(index)
  }

  onTargetChange(index) {
    // item target changed
    this.currentItem = this.items[index]
    if (!this.currentItem.texture) return
    // update texture
    this.uniforms.uTexture.value = this.currentItem.texture
    // compute image ratio
    let imageRatio = this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight
    // scale plane to fit image dimensions
    this.scale = new THREE.Vector3(imageRatio, 1, 1)

    // only one plane
    //this.plane.scale.copy(this.scale)

    // several planes
    this.trails.forEach( trail => {
      trail.scale.copy(this.scale)
    })
  }

  // update position
  // we need is the 3D coordinates in order to move our plane in the scene.
  // we need to remap the mouse coordinate to the view size of our scene.
  // for that:
  // 1ª
  // compute the plane's fit-to-screen dimensions by resolving AAS triangles
  // using the camera position and camera FOV.

  get viewSize() {
    let distance = this.camera.position.z
    let vFov = (this.camera.fov * Math.PI) / 180
    let height = 2 * Math.tan(vFov / 2) * distance
    let width = height * this.viewport.aspectRatio

    return {
      width,
      height,
      vFov
    }
  }

  // 2ª
  // remap the normalized mouse position with the scene view dimensions using a
  // value mapping function.
  // Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  //   return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  // }

  onMouseMove(event) {
    // project mouse position to world coordinates
    let x = this.mouse.x.map(
      -1,
      1,
      -this.viewSize.width / 2,
      this.viewSize.width / 2
    )

    let y = this.mouse.y.map(
      -1,
      1,
      -this.viewSize.height / 2,
      this.viewSize.height / 2
    )

    // update plane position
    this.position = new THREE.Vector3(x, y, 0)

    TweenLite.to(this.plane.position, 1, {
      x: x,
      y: y,
      ease: Power4.easeOut,
      onUpdate: this.onPositionUpdate.bind(this)
    })

    // set a delay to plane copies
    this.trails.forEach((trail, index) => {
      let duration =
        this.options.duration * this.options.amount - this.options.duration * index
        TweenLite.to(trail.position, duration, {
          x: x,
          y: y,
          ease: Power4.easeOut
        })
    })
  }


  // fadding the opacity

  onMouseEnter() {
    if (!this.currentItem || !this.isMouseOver) {
      this.isMouseOver = true
      // show plane
      TweenLite.to(this.uniforms.uAlpha, 0.5, {
        value: 1,
        ease: Power4.easeOut
      })
    }
  }

  onMouseLeave() {
    TweenLite.to(this.uniforms.uAlpha, 0.5, {
      value: 0,
      ease: Power4.easeOut
    })
  }


  // set the distorsion
  onPositionUpdate() {
    // compute offset
    let offset = this.plane.position
      .clone()
      .sub(this.position) // velocity
      .multiplyScalar(-this.options.strength)
    this.uniforms.uOffset.value = offset
  }

} export default Image3_1
