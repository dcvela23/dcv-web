import { offset } from './../utils/offset'
import { hasClass, addClass, removeClass, toggleClass } from './../utils/classes'
import { getParams } from '../utils/getParams.js'

class Navbar {
  constructor(el){
    this.navbar = {el: el};
    this.navbarEl = this.navbar.el;
    this.navbarHeight = this.navbarEl.offsetHeight;
    this.navbarTop;
    this.navbarBottom = this.navbarHeight + this.navbarTop;
    this.navbarLinks = this.navbarEl.querySelectorAll('a');
    this.navbarMobileToggle = this.navbarEl.querySelectorAll('.navbar__mobile__toggle');
    this.navbarDropdownBtn = this.navbarEl.querySelectorAll('.navbar__dropdown');
    this.navbarLang = this.navbarEl.querySelector('.wpml-ls-current-language > a');
    this.navbarNewsletterBtn = this.navbarEl.querySelector('.navbar__buttons');

    this.initEvents();

    if (window.matchMedia("(min-width: 1024px)").matches) {
      this.initDesktopEvents();
    }
    if (window.matchMedia("(max-width: 1023px)").matches) {
      this.initMobileEvents();
    }
  }

  initEvents() {
    //this.changeLang();
  }

  initDesktopEvents(){
    var that = this;
    document.addEventListener("scroll", function(){
      that.addSticky();
    });

    that.navbarNewsletterBtn.addEventListener("click", function(){
      that.moveToSection(that.navbarNewsletterBtn);
    });

  };
  initMobileEvents(){
    var that = this;

    this.navbarMobileToggle.forEach(function(el){
      el.addEventListener("click", function(){
        that.showNavMobile();
      });
    })


    this.navbarDropdownBtn.forEach(function(el){
      el.addEventListener("click", function(){
        that.toggleDropdown(el);
      });
    })

    that.navbarNewsletterBtn.addEventListener("click", function(){
      that.moveToSection(that.navbarNewsletterBtn);
    });

    that.navbarLang.addEventListener("click", function(e){
      if (!e.currentTarget.classList.contains('active')) {
        e.preventDefault();
      }

      that.toggleDropdown(that.navbarEl.querySelector('.wpml-ls-current-language'));
    });

  }
  addSticky(){
    this.navbarTop = offset(this.navbarEl).top;

    if (this.navbarTop > 100){
      if (!hasClass(this.navbarEl, 'sticky')){
        addClass(this.navbarEl, 'sticky')
      }
    } else {
      removeClass(this.navbarEl, 'sticky')
    }
  }
  showNavMobile(){
    toggleClass(this.navbar.el, 'opened')
  }

  toggleDropdown(el){
    toggleClass(el, 'active');
  }

  moveToSection(link){
    let sectionTo = link.getAttribute('data-link')
    if (sectionTo !== null) {
      event.preventDefault();
      let sectionEl = document.querySelector('.' + sectionTo + '')
      window.scrollTo({
        top: offset(sectionEl).top,
        left: 0,
        behavior: 'smooth'
      });

      if (window.matchMedia("(max-width: 1030px)").matches) {
        toggleClass(this.navbarEl, 'opened')
      }
    }
  };

  changeLang() {
    let langWrapper = this.navbar.el.querySelector('.navbar__lang')
    let langSelected = getParams('lg', window.location.href);

    if (langSelected !== null && langWrapper !== null) {
      if (langSelected === 'es') {
        removeClass(this.navbar.el.querySelector('.navbar__lang > .icon'), 'visible')
        addClass(this.navbar.el.querySelector('.navbar__lang > .icon--spanish'), 'visible')
      } else if (langSelected === 'en') {
        removeClass(this.navbar.el.querySelector('.navbar__lang > .icon'), 'visible')
        addClass(this.navbar.el.querySelector('.navbar__lang > .icon--english'), 'visible')
      }
    } else {
      removeClass(this.navbar.el.querySelector('.navbar__lang > .icon'), 'visible')
      addClass(this.navbar.el.querySelector('.navbar__lang > .icon--spanish'), 'visible')
    }
  }
} export default Navbar;
