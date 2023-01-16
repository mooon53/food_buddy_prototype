import './lib/JQuery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import ProductEntry from './elements/product-entry.js';
import USER_SETTINGS, { respectsAllergies, respectsDiet } from './user-settings.js';

const NUTRISCORE_MAPPING = {
    '?': 'unknown',
    'A': 'low',
    'B': 'moderate-low',
    'C': 'moderate',
    'D': 'moderate-high',
    'E': 'high'
}

const PRODUCT_ID = new URLSearchParams(window.location.search).get('code');

window.addEventListener('DOMContentLoaded', () => {
    OpenFoodFactsAPI.search(PRODUCT_ID ?? '8718906821934')
    .then(res => { // insert product details
        $(document.body).addClass(respectsAllergies(res) ? 'safe' : 'unsafe');

        // general info
        $('#product-name').text(res.name.includes(res.brands) ? res.name : `${res.brands} ${res.name}`);
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
                    <h2>${ingredient.percentage >= 0.1 ? ingredient.percentage.toFixed(1) : '<0.1'}%</h2>
                </div>
            `);
        }

        // allergens
        if (res.allergens.length === 0) $('#allergens').append(`<h2>No known allergens...</h2>`);
        else for (const a of res.allergens) {
            $('#allergens').append(`<h2>• ${a.substring(3)}</h2>`);
        }

        OpenFoodFactsAPI.getAlternatives(res)
        .then(res => {
            let count = 0;
            let i = 0;
            while (count < 10 && i < res.length) {
                if (respectsAllergies(res[i])) {
                    $('#recommendations').append(new ProductEntry(res[i]));
                    count ++;
                }
                i ++;
            }
        })
        .catch(err => {
            console.log(err);
            alert('Could not get alternatives');
        });

    })
    .catch(err => {
        console.log(err);
        alert('Could not find product');
    });
});