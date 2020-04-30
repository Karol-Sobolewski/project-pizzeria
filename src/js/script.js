/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      ////console.log('new Product', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      ////console.log('generateHTML', generateHTML);

      /* create element using  utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu*/
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      ////console.log(' thisProduct.form', thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      ////console.log('thisProduct.formInputs', thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      ////console.log('cartButton', thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      ////console.log('priceElem', thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      ////console.log('imageWrapper', thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickTrigger =  thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      clickTrigger.addEventListener('click', function(event){

        /* prevent default action for event */
        event.preventDefault();

        /* find active products */
        const activeProduct = document.querySelector(select.all.menuProductsActive);

        /*if and the active product isn't the element of thisProduct */
        if(activeProduct && activeProduct !== thisProduct.element) activeProduct.classList.remove('active');

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
      /* END: click event listener to trigger */
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {};

      let price = thisProduct.data.price;

      /*find all values (coffee, sauce, toppings, crust, ect) in params object (params={}) */
      for(let paramId in thisProduct.data.params){
        ////console.log('paramId', paramId);
        /* coonstans options = key {label, type, options} of value in params object*/
        const param = thisProduct.data.params[paramId];

        /*Start loop for each key of value in params object*/
        for (let optionId in param.options){
          const option = param.options[optionId];

          /*?????*/
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /*START IF: if option is selected and option is not default else if option is not selected and option is default*/
          if(optionSelected && !option.default){
            price += option.price;
          } else if(!optionSelected && option.default){
            price -= option.price;
          }
          const selectedImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          if(optionSelected){
            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            //console.log('option', thisProduct.params);

            for(const selectedImage of selectedImages){
              ////console.log('selectedImage', selectedImage);
              selectedImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for(const selectedImage of selectedImages){

              selectedImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

        /*end loop for options in params*/
        }

      /*end loop for all params */
      }
      //price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      //console.log('thisProduct.amountWidget.value', thisProduct.amountWidget.value);
      thisProduct.priceElem.innerHTML = thisProduct.price;


      /* End of processOrder */
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, thisProduct.data.amount);
      console.log(thisProduct);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }


    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget{
    constructor(element, amount){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.amount = amount;

      console.log(thisWidget.amount);
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      //console.log('AmountWidget', thisWidget);
      //console.log('constructor arguments', element);

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      //console.log(' thisWidget.input', thisWidget.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      ////console.log('thisWidget.value', thisWidget.input.value);
    }


    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      if (thisWidget.hasOwnProperty('amount')){
      /*if new value is greater than current && if new value equal or higher settings.amountWidget.defaultMin
      new value is equal or lower than settings.amountWidget.defaultMax then:
       else new value is number or is highher than 9 and lower than 1 = new value is false -> show current value */
        if(newValue !== thisWidget.value && newValue >= thisWidget.amount.min && newValue <= thisWidget.amount.max){
          thisWidget.value = newValue;
          thisWidget.announce();
        } else {
          thisWidget.value;
        }
      ////console.log('thisWidget.value', thisWidget.value);
      } else {
        if(newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
          thisWidget.value = newValue;
          thisWidget.announce();
        } else {
          thisWidget.value;
        }
      }
      thisWidget.input.value = thisWidget.value;
      //console.log('newValue', newValue);
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(event){
        event.preventDefault();
        //console.log('thisWidget.input', thisWidget.input.value);
        thisWidget.setValue(thisWidget.input.value);

      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        //console.log('mniej');
        thisWidget.setValue(thisWidget.value-1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        //console.log('więcej');
        thisWidget.setValue(thisWidget.value+1);
      });

    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }


  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);

      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;

      console.log('thisCart.dom.wrapper', thisCart.dom.wrapper);

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      console.log(thisCart.dom.toggleTrigger);

      thisCart.dom.productList = document.querySelector(select.containerOf.cart);
    }

    initActions(){
      const thisCart = this;

      //const clickTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle('active');
      });
    }

    add(menuProduct){
      const thisCart = this;
      const generateHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generateHTML);

      /* find menu container */

      /* add element to menu*/
      thisCart.dom.productList.appendChild(generatedDOM);

      console.log('adding product', menuProduct);
    }
  }

  const app = {
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initMenu: function(){
      const thisApp = this;

      //console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      ////console.log('*** App starting ***');
      ////console.log('thisApp:', thisApp);
      ////console.log('classNames:', classNames);
      ////console.log('settings:', settings);
      ////console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();

}
