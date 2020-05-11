import {select, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    //console.log(' thisCart.dom.form',  thisCart.dom.form);
    //correctValue
    thisCart.dom.form.phone = thisCart.dom.wrapper.querySelector(select.cart.phone.value);
    thisCart.dom.form.address = thisCart.dom.wrapper.querySelector(select.cart.address.value);

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle('active');
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;
    const generateHTML = templates.cartProduct(menuProduct);
    //console.log('html', generateHTML);
    const generatedDOM = utils.createDOMFromHTML(generateHTML);
    //console.log('dom', generatedDOM);
    thisCart.dom.productList.appendChild(generatedDOM);
    //console.log('thisCart.dom.productList', thisCart.dom.productList);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart', thisCart.dom.productList);

    thisCart.dom.wrapper.classList.add('active');
    thisCart.update();
  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf('cartProduct');
    //console.log('index',  index);
    thisCart.products.splice(index);
    //console.log('thisCart.products',   thisCart.products);
    cartProduct.dom.wrapper.remove();
    //console.log('thiscart dom wrapper',  cartProduct.dom);
    //console.log(cartProduct.dom.wrapper.remove);
    //console.log('cartProduct4',  cartProduct);
    //thisCart.dom.wrapper.classList.toggle('active');
    thisCart.update();

  }

  reset(){
    const thisCart = this;
    thisCart.products = [];
    thisCart.dom.form.reset();
    thisCart.deliveryFee = 0;
    thisCart.dom.productList.innerHTML = '';
    thisCart.update();

  }

  update(){
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products){
      //console.log('thisCart', product);
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber +=  product.amount;
      //console.log(  product );
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for(let key of thisCart.renderTotalsKeys){
      for (let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      address: thisCart.dom.form.address.value,
      phone: thisCart.dom.form.phone.value,
      products: [],
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
    };

    for(let product in thisCart.products){
      //console.log('product', thisCart.products[product]);
      const productOrder = thisCart.products[product].getData();
      payload.products.push(productOrder);
      thisCart.update();
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => {
        console.log('parsedResponse', parsedResponse, thisCart.dom.form.phone);
        thisCart.reset();
        thisCart.update();
      });
  }

}

export default Cart;
