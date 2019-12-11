import navbar from './modules/navbar.js';
import objectFitFallback from './modules/objectFitFallback';
//
import Image3_1 from './modules/image3-1.js';
import Drag_1 from './modules/drag-1.js';
//
import { checkIE } from './utils/browsers.js'
import { forEachPolyfill, arrayFromIE, startsWithPolyfill } from './utils/polyfill'
import { addClass } from './utils/classes.js';
import { debounce } from './utils/debounce.js';
import  './lib/modernzr.js';
import  './lib/three.js';


// trigger CustomizeSelect just one time
var selectCustomized = false;


function initEvents() {
  forEachPolyfill();
  arrayFromIE();
  startsWithPolyfill();

  if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) ) {
    addClass(document.querySelector('body'), 'ie')
  }


  //navbar
  //
  //var NavbarInit = new navbar(document.querySelector("#nav"));

  //image3-1
  //
  if (document.querySelector("#imag3-1")) {
    var Image3_1Init = new Image3_1(document.querySelector("#imag3-1"));
  }

  //drag-1
  //
  if (document.querySelector("#drag-1")) {
    var Drag_1Init = new Drag_1(document.querySelector("#drag-1"));
  }

}

(function() {
  initEvents()
})()

// handle resize

var resetScript = debounce(function() {
  //
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    initEvents()
  } else {
    initEvents()
  }
}, 250);



window.addEventListener('resize', resetScript);
