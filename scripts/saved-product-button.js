import './lib/JQuery.js';
import LocallyStoredSet from './LocallyStoredSet.js';

const SAVED_PRODUCTS = new LocallyStoredSet('saved-products');

const PRODUCT_ID = new URLSearchParams(window.location.search).get('code');
var saved = SAVED_PRODUCTS.includes(PRODUCT_ID);

function setButtonSrc() {
    if (saved) $('#save-button').attr('src', './images/icons/heart-filled.svg');
    else $('#save-button').attr('src', './images/icons/heart.svg');
}

window.addEventListener('DOMContentLoaded', setButtonSrc);

window.toggleSaved = function() {
    saved = SAVED_PRODUCTS.toggle(PRODUCT_ID);
    setButtonSrc();
}