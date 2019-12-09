import { addClass } from './../utils/classes.js'

class Image3_1 {
  constructor(el, options = {}){
    this.container = document.body;
    this.itemsWrapper = el.querySelector('ul')
    // setUp the effect: scene, items, textures
    if (!this.container || !this.itemsWrapper) return
    this.setup()
    this.initEffectShell().then(() => {
      this.isLoaded = true
    })
    // create geomtetry with material and shader
    options.strength = options.strengh || 0.25
    this.options = options
    this.init()
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

       void main() {
         vUv = uv;
         vec3 newPosition = position;
         gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
       }
     `,
     fragmentShader: `
       uniform sampler2D uTexture;
       uniform float uAlpha;
       varying vec2 vUv;

       void main() {
         vec3 color = texture2D(uTexture,vUv).rgb;
         gl_FragColor = vec4(color,1.0);
       }
     `,
     transparent: true
    })
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.plane)
  }


} export default Image3_1
