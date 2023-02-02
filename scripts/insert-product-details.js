import './lib/JQuery.js';
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import ProductEntry from './elements/product-entry.js';
import { respectsAllergies } from './user-settings.js';

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
    .then(product => { // insert product details
        $(document.body).addClass(respectsAllergies(product) ? 'safe' : 'unsafe');

        // general info
        $('#product-name').text(product.name.includes(product.brands) ? product.name : `${product.brands} ${product.name}`);
        $('#product-weight').text(`(${product.quantity})`);

        // nutri-score
        $('#product-nutri-score > h2').text(product.nutritionalInfo.nutriscore);
        $('#product-nutri-score').addClass(NUTRISCORE_MAPPING[product.nutritionalInfo.nutriscore]);

        // nutritional info
        $('#product-sugar-content').addClass(product.nutritionalInfo.sugar);
        $('#product-fat-content').addClass(product.nutritionalInfo.fat);
        $('#product-saturated-fat-content').addClass(product.nutritionalInfo.saturatedFat);
        $('#product-salt-content').addClass(product.nutritionalInfo.salt);

        // ingredients
        for (const ingredient of product.ingredients) {
            $('#ingredients').append(`
                <div class="ingredient centered-columns">
                    <h2>• ${ingredient.name}</h2>
                    <h2>${ingredient.percentage >= 0.1 ? ingredient.percentage.toFixed(1) : '<0.1'}%</h2>
                </div>
            `);
        }

        // allergens
        if (product.allergens.length === 0) $('#allergens').append(`<h2>No known allergens...</h2>`);
        else for (const a of product.allergens) {
            $('#allergens').append(`<h2>• ${a.substring(3)}</h2>`);
        }

        OpenFoodFactsAPI.getAlternatives(product)
        .then(recommendations => {
            recommendations = recommendations.filter(r => r.id !== product.id);
            recommendations.sort((a,b) => b.getSimilarityScore(product)-a.getSimilarityScore(product));
            let count = 0;
            let i = 0;
            while (count < 10 && i < recommendations.length) {
                if (respectsAllergies(recommendations[i])) {
                    $('#recommendations').append(new ProductEntry(recommendations[i]));
                    count ++;
                }
                i ++;
            }

            if (i === 0) $('#recommendations').append(`<h2>No recommendations</h2>`);
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