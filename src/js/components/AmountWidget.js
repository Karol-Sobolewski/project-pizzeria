import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element, amount) {
    super(element, amount ? amount.min : settings.amountWidget.defaultValue);

    if(!amount) {
      const thisWidget = this;
      thisWidget.amount = {
        min: settings.amountWidget.defaultMin,
        max: settings.amountWidget.defaultMax
      };
    } else {
      const thisWidget = this;
      thisWidget.amount = amount;
      console.log(' thisWidget.amount',  thisWidget.amount);
    }

    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions();
  }

  getElements(){
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    console.log('thisWidgetxd', thisWidget);
    thisWidget.dom.input.value = thisWidget.amount.min;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(event){
      event.preventDefault();
      /*still reloads after pressing enter*/
      //console.log('change');
      thisWidget.value = thisWidget.dom.input.value;
      //thisWidget.dom.input.dispatchEvent(event);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value - 1);
      thisWidget.value = --thisWidget.dom.input.value;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value + 1);
      thisWidget.value = ++thisWidget.dom.input.value;
      thisWidget.announce();
    });

  }

  isValid(value){
    return !isNaN(value)
    && value >= this.amount.min
    && value <= this.amount.max;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
    console.log('x', thisWidget.dom.input.value);
  }


}

export default AmountWidget;
