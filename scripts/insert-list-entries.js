import './lib/JQuery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import ProductEntry from './elements/product-entry.js';
import LocallyStoredSet from './LocallyStoredSet.js';

const SAVED_PRODUCTS = new LocallyStoredSet('saved-products');

const productInfos = [];
var loaded = false;
var gotProducts = false;

function insertEntries() {
    productInfos.sort((a,b) => SAVED_PRODUCTS.all.indexOf(a.id) - SAVED_PRODUCTS.all.indexOf(b.id));
    productInfos.forEach(p => $('#products-list').append(new ProductEntry(p)));
}

SAVED_PRODUCTS.all.forEach(c => {
    OpenFoodFactsAPI.search(c)
    .then(res => {
        productInfos.push(res);
        if (productInfos.length === SAVED_PRODUCTS.all.length) gotProducts = true;
    })
    .catch(console.log);
});

window.addEventListener('DOMContentLoaded', () => {
    loaded = true;
});

const interval = setInterval(() => {
    if (loaded && gotProducts) {
        insertEntries();
        console.log('inserted');
        clearInterval(interval);
    }
    else {
        console.log(`gotProducts = ${gotProducts}, loaded = ${loaded}`);
    }
}, 100);
