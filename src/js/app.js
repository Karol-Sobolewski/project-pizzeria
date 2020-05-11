import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);


    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href atribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.acivatePage with that id */
        thisApp.activatePage(id);

        /* change url hash */

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp =this;

    /* add class 'active' to matching pages, remove from non-matchig */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class 'active' to matching links, remove from non-matchig */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {}; //CODE CHANGED
    //CODE ADDED START
    const url = settings.db.url;
    fetch(url + '/' + settings.db.product)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {

        /* save parsed response as thisApp.data.products*/
        thisApp.data.products = parsedResponse;

        /*execute initMenu method */
        thisApp.initMenu();

      });

    fetch(url + '/' + settings.db.booking)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        thisApp.data.booking = parsedResponse;
        thisApp.initBooking();
      })
      .catch((error) => {
        console.warn('CONNECTION ERROR', error);
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
    //CODE ADDED END
  },
  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      //new Product(productData, thisApp.data.products[productData]);
      //console.log('productData',  thisApp.data.products);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);

    }
  },
  initBooking: function(){
    const thisApp = this;
    const bookingElem = document.querySelector(select.containerOf.booking);

    const tables = thisApp.data.booking[0].tables;
    thisApp.booking = new Booking(bookingElem, tables);

    console.log('bookingElem', thisApp.booking);
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
