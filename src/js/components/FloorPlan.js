import BaseWidget from './BaseWidget.js';

class FloorPlan extends BaseWidget{
  constructor (wrapper){
    super(wrapper);
    const thisWidget = this;
    console.log('thisWidget.dom', thisWidget.dom);
    console.log('thisWidget', thisWidget);

  }
}

export default FloorPlan;
