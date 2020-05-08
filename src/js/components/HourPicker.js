import BaseWidget from './BaseWidget.js';
import { settings, select } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    console.log('thisWidget.dom.input', thisWidget.dom.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    console.log('thisWidget.dom.output', thisWidget.dom.output);
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;
    //thisWidget.minHour = new
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
      //console.log('value', parseInt);
      console.log('thisWidget.dom.output', thisWidget.dom.output);
      //console.log('thisWidget.dom.input', thisWidget.dom.input);
      //console.log('thisWidget.dom.output', thisWidget.dom.output);
      //console.log('thisWidget.value', thisWidget.value);
    });
  }

  parseValue(value){

    return utils.numberToHour(value);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
    //console.log('thisWidget.dom.output', thisWidget.dom.output);
  }
}

export default HourPicker;
