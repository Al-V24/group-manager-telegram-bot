// get the reference of EventEmitter class of events module
const events = require('events');

//create an object of EventEmitter class by using above reference
const em = new events.EventEmitter();

module.exports = em;