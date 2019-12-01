import { classListIE } from './polyfill'


export function hasClass(el, className) {
	classListIE();
	return el.classList ? el.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

export function addClass(el, className) {
	classListIE();
	if (el.classList) {
		el.classList.add(className);
	} else if (!hasClass(el, className)) {
		el.className += ' ' + className;
	}
}

export function removeClass(el, className) {
	classListIE();

  if (el.classList){
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

export function toggleClass(el, className) {
	classListIE();

	if (el.classList) {
	  el.classList.toggle(className);
	} else {
	  var classes = el.className.split(' ');
	  var existingIndex = classes.indexOf(className);

	  if (existingIndex >= 0)
	    classes.splice(existingIndex, 1);
	  else
	    classes.push(className);
	  el.className = classes.join(' ');
	}
}
