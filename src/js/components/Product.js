import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);

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
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    //console.log('thisProduct.formInputs', thisProduct.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
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
    console.log(formData);
    thisProduct.params = {};

    let price = thisProduct.data.price;

    /*find all values (coffee, sauce, toppings, crust, ect) in params object (params={}) */
    for(let paramId in thisProduct.data.params){

      /* coonstans options = key {label, type, options} of value in params object*/
      const param = thisProduct.data.params[paramId];

      /*Start loop for each key of value in params object*/
      for (let optionId in param.options){
        const option = param.options[optionId];

        /* check if formData has property paramId and if that param id has index of optionId*/

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

          for(const selectedImage of selectedImages){
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

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.correctValue;
    thisProduct.priceElem.innerHTML = thisProduct.price;

    /* End of processOrder */
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, thisProduct.data.amount);
    thisProduct.amountWidgetElem.addEventListener('updated', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    const thisProductCopy = JSON.parse(JSON.stringify(thisProduct));

    thisProductCopy.name = thisProductCopy.data.name;
    thisProductCopy.amount = thisProductCopy.amountWidget.correctValue;

    //app.cart.add(thisProductCopy);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProductCopy,
      },
    });
    thisProduct.element.dispatchEvent(event);

    thisProduct.reset();
  }

  reset() {
    const thisProduct = this;
    thisProduct.form.reset();
    //console.log('hisProduct.amountWidget.value', thisProduct.amountWidget);
    thisProduct.processOrder();
  }
}

export default Product;
