//<input type="text" id="fiptest">
const htmlBody = '<!DOCTYPE html><html><head></head><body></body></html>';
const jsdom = new JSDOM( htmlBody );

// Set window and document from jsdom
const { window } = jsdom;
const { document } = window;

// Also set global window and document before requiring jQuery
global.window = window;
global.document = document;

const $ = global.jQuery = require( 'jquery' );

//console.log( `jQuery ${jQuery.fn.jquery} working! Yay!!!` );
const inputElement = $('body');

console.log("test");
console.log(inputElement);