import './lib/jquery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import ProductEntry from './elements/product-entry.js';

window.addEventListener('DOMContentLoaded', () => {
    OpenFoodFactsAPI.search('3017620422003')
    .then(product => {
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
        $('div#products-list').append(new ProductEntry(product));
    })
    .catch(console.log);
});