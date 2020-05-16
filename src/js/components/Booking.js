import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element, allTables){
    const thisBooking = this;
    thisBooking.render(element, allTables);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }

  getData(){
    const thisBooking = this;


    const startDateParam =  settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        console.log(bookingsResponse.json);
        return  Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1) ){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    console.log('thisBooking.date', thisBooking.date);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log('thisBooking.date', thisBooking.hourPicker.value);
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    const tables = thisBooking.dom.tables;
    for(let table of tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
        thisBooking.table = table;
        console.log('tables +', parseInt(tableId));
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBookedSvr);
        console.log('table12', table);
      } else {
        table.classList.remove(classNames.booking.tableBookedSvr);
      }
    }
  }

  initActions(){
    const thisBooking = this;
    const tables = thisBooking.dom.tables;
    console.log('tablesarray', thisBooking.dom.tables);
    let bookedTable = '';
    for(let table of tables){
      table.addEventListener('click', function(){
        console.log(table, 'table clicked');
        if(!table.classList.contains(classNames.booking.tableBookedSvr)){
          console.log(table.classList.contains(classNames.booking.tableBookedSvr));
          const activeTables = document.querySelectorAll('.table.booked');
          for (let activeTable of activeTables){
            activeTable.classList.remove(classNames.booking.tableBooked);
          }
          table.classList.add(classNames.booking.tableBooked);
          //table.classList.add(classNames.booking.tableBooked);

          bookedTable = table.getAttribute(settings.booking.tableIdAttribute);
          console.log('bookedTable', bookedTable);
          //console.log('activeTables', bookedTable)
          thisBooking.table = bookedTable;
        }
      });
    }

    thisBooking.hourPicker.dom.input.addEventListener('input', function() {
      if (bookedTable.length > 0) {
        console.log('tables[bookedTable-1]', tables);
        tables[bookedTable-1].classList.remove(classNames.booking.tableBooked);
      }
    });

    thisBooking.datePicker.dom.input.addEventListener('input', function() {
      if (bookedTable.length > 0) {
        tables[bookedTable-1].classList.remove(classNames.booking.tableBooked);
      }
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      console.log(' thisBooking.table', thisBooking.table);
      //if(thisBooking.table.classList.contains(classNames.booking.tableBookedSvr)){
      //alert('empty');
      //}
      //event.preventDefault();
      //thisBooking.sendBooking();
    });

  }

  getSelectedCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    let values = [];
    checkboxes.forEach((checkbox) => {
      values.push(checkbox.value);
    });
    return values;
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      id: '',
      table: thisBooking.table,
      date: thisBooking.datePicker.correctValue,
      hour:thisBooking.hourPicker.correctValue,
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.peopleAmount.correctValue,
      starers: thisBooking.getSelectedCheckboxValues('starter'),
      phone: thisBooking.dom.form.phone.value,
      adress: thisBooking.dom.form.address.value,
      repeat: false,
    };
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
        console.log('parsedResponse', parsedResponse);
        //thisCart.reset();
        //thisCart.update();
      });
  }


  render(element, tables){
    const thisBooking = this;

    const generateHTML = templates.bookingWidget({ tables: tables });
    //console.log(generateHTML);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.element = utils.createDOMFromHTML(generateHTML);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    console.log('thisBooking.dom.starters', thisBooking.dom.starters);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    //console.log('wrapper', thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
}

export default Booking;
