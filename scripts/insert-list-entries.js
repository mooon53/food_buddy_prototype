import './lib/JQuery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import ProductEntry from './elements/product-entry.js';
import SavedProducts from './saved-products.js';

const productInfos = [];
var loaded = false;
var gotProducts = false;

function insertEntries() {
    productInfos.sort((a,b) => SavedProducts.all.indexOf(a.id) - SavedProducts.all.indexOf(b.id));
    productInfos.forEach(p => $('#products-list').append(new ProductEntry(p)));
}

SavedProducts.all.forEach(c => {
    OpenFoodFactsAPI.search(c)
    .then(res => {
        productInfos.push(res);
        if (productInfos.length === SavedProducts.all.length) gotProducts = true;
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
