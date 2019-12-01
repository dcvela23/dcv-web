import { addClass } from './../utils/classes.js'

class objectFitFallback {
  constructor(el){
    this.image = { el:el };
    this.triggerFallback();

    //console.log(Modernizr)
  }

  triggerFallback(){
    //!Modernizr.objectfit
    if( !Modernizr.objectfit ){
      const container = this.image.el;
      const srcset = container.querySelector('img').getAttribute('srcset');
      const path = srcset.slice(0, srcset.indexOf(' '))
      container.style.backgroundImage = 'url(' + path + ')';
      addClass(container, 'image--compat-object-fit'); 
    }
  }
} export default objectFitFallback