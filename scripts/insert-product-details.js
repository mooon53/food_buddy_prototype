import './lib/JQuery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';

const NUTRISCORE_MAPPING = {
    '?': 'unknown',
    'A': 'low',
    'B': 'moderate-low',
    'C': 'moderate',
    'D': 'moderate-high',
    'E': 'high'
}

const PRODUCT_ID = '8712800035657';

window.addEventListener('DOMContentLoaded', () => {
    OpenFoodFactsAPI.search(PRODUCT_ID)
    .then(res => { // insert product details

        // general info
        $('#product-name').text(res.name);
        $('#product-weight').text(`(${res.quantity})`);

        // nutri-score
        $('#product-nutri-score > h2').text(res.nutritionalInfo.nutriscore);
        $('#product-nutri-score').addClass(NUTRISCORE_MAPPING[res.nutritionalInfo.nutriscore]);

        // nutritional info
        $('#product-sugar-content').addClass(res.nutritionalInfo.sugar);
        $('#product-fat-content').addClass(res.nutritionalInfo.fat);
        $('#product-saturated-fat-content').addClass(res.nutritionalInfo.saturatedFat);
        $('#product-salt-content').addClass(res.nutritionalInfo.salt);

        // ingredients
        for (const ingredient of res.ingredients) {
            $('#ingredients').append(`
                <div class="ingredient centered-columns">
                    <h2>• ${ingredient.name}</h2>
                    <h2>${ingredient.percentage.toFixed(0)}%</h2>
                </div>
            `);
        }

    })
    .catch(err => {
        console.log(err);
        alert('Could not find product');
    });
});