import './lib/JQuery.js';
import SavedProducts from "./saved-products.js";

const PRODUCT_ID = new URLSearchParams(window.location.search).get('code');
var saved = SavedProducts.includes(PRODUCT_ID);

function setButtonSrc() {
    if (saved) $('#save-button').attr('src', './images/icons/heart-filled.svg');
    else $('#save-button').attr('src', './images/icons/heart.svg');
}

window.addEventListener('DOMContentLoaded', setButtonSrc);

window.toggleSaved = function() {
    saved = SavedProducts.toggle(PRODUCT_ID);
    setButtonSrc();
}