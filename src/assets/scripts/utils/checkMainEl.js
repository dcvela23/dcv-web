import { offset } from './offset.js';

export const checkMainEl = function checkMainEl(arrayEl) {
  let arrayObjEl = [];
  //
  let windowHeight = window.innerHeight;
  let windowTop = document.documentElement.scrollTop;
  let windowBottom = windowTop + windowHeight;
  //
  arrayEl.forEach(function(el){
    let objEl = { el: ''};
    //
    let elHeight = el.offsetHeight;
    let elTop = offset(el).top;
    let elBottom = elHeight + elTop;
    //
    let pxInView;
    //
    if ( (elTop < windowTop) && (elBottom > windowBottom) ) {
      pxInView = windowHeight;
    } else if ( (elTop > windowTop) && ( elBottom < windowBottom) ) {
      pxInView = elHeight
    } else if ( elTop < windowTop ) {
      pxInView = elBottom - windowTop
    } else if ( elBottom > windowBottom) {
      pxInView = windowBottom - elTop
    }
    //
    let percentInView = (pxInView * 100) / windowHeight;
    objEl.el = el;
    objEl.percentInView = percentInView;
    arrayObjEl.push(objEl);
  })
  //
  let higherPercent = Math.max.apply(Math,arrayObjEl.map(function(obj){return obj.percentInView;}))
  let mainElInView = arrayObjEl.find(obj => {
    return obj.percentInView === higherPercent
  })
  //
  if (mainElInView !== undefined) {
    return mainElInView.el
  }
}
