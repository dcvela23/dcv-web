import { offset } from './offset.js';

export const checkInView = function checkInView(el) {
  // console.log(document.documentElement.scrollTop || document.body.scrollTop)
  let windowHeight = window.innerHeight;
  let windowTop = document.documentElement.scrollTop;
  let windowBottom = windowTop + windowHeight;
  //
  let elHeight = el.offsetHeight;
  let elTop = offset(el).top;
  let elBottom = elHeight + elTop;
  //
  if ( (elTop <= windowBottom) && (elBottom >= windowTop)) {
    return true
  }
}
