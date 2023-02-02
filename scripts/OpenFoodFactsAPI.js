import LocallyStoredSet from "./LocallyStoredSet.js";
const ALLERGIES = new LocallyStoredSet('saved-allergies').all;

export default class OpenFoodFactsAPI {

    static LANGUAGE_PREFERENCE = ['en','nl','fr','de'];

    static #API_URL_BASE = "https://world.openfoodfacts.org/api/v2";

    /**
     * Searches a product in the OpenFoodFacts database.
     * @param {string} id id/barcode of the product
     * @returns {Promise<ProductInfo>} A promise that resolves with the product's info
     * (and rejects with a reason why) 
     */
    static search(id) {
        if (typeof id !== 'string') id = id.toString();
        id = id.trim();

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();

            req.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) { // got OK response
                        const res = JSON.parse(this.responseText);
                        if (res.count === 0) reject('No results found');
                        else resolve(new ProductInfo(res.products[0]));
                    }
                    else reject(`Could not fetch resource: ${this.responseText}`);
                }
            };

            req.open('GET', `${this.#API_URL_BASE}/search?code=${id}`, true);
            req.send();
        });
    }

    /**
     * Gives a promise that resolves with list of products that are like the given one.
     * @param {ProductInfo} product 
     * @returns {Promise<ProductInfo[]>}
     */
    static getAlternatives(product) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();

            req.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        const res = JSON.parse(this.responseText);
                        resolve(res.products.map(p => new ProductInfo(p)));
                    }
                    else reject(`Could not fetch resource: ${this.responseText}`);
                }
            }

            let url = `${this.#API_URL_BASE}/search?`;
            if (ALLERGIES.length > 0) url += 'allergens_tags=' + ALLERGIES.map(a => '-' + a).join(',') + '&';
            if (product.foodGroups.length > 0) url += 'food_groups_tags=' + product.foodGroups.join(',') + '&';
            if (product.countries.length > 0) url += 'countries_tags=' + product.countries.join('|') + '&'; // find matching country
            if (product.stores.length > 0) url += 'stores_tags=' + product.stores.join('|') + '&'; // find matching store
            if (product.type) url += 'compared_to_category=' + product.type + '&';
            console.log(url);

            req.open('GET', url, true);
            req.send();
        });
    }

}

export class ProductInfo {
    
    static FIELD_RESPONSE_MAPPING = { // describes functions to get certain information out of a response object
        id: res => res.code,
        name: res => {
            let name = undefined;
            for (const lang of OpenFoodFactsAPI.LANGUAGE_PREFERENCE) {
                const langName = res['product_name_'+lang];
                if (langName !== undefined && langName.length > 0) {
                    name = langName;
                    break;
                }
            }
            return name ?? (res.product_name ? res.product_name : 'Unknown Product');
        },
        brands: res => res.brands ?? [],
        brandTags: res => res.brands_tags ?? [],
        quantity: res => res.quantity ? res.quantity : '??? grams',
        imageURL: res => res.image_front_url ?? '/images/icons/question-mark.svg',
        foodGroups: res => res.food_groups_tags ?? [],
        categories: res => res.categories_hierarchy ?? [],
        allergens: res => res.allergens_tags ?? [],
        ingredients: res => {
            if (res.ingredients) return res.ingredients.map(i => new ProductIngredient(i)).sort((a,b)=>b.percentage-a.percentage);
            else return [ProductIngredient.UNKNOWN_INGREDIENT];
        },
        nutritionalInfo: res => new NutritionalInfo(res),
        countries: res => res.countries_tags ?? [],
        stores: res => res.stores_tags ?? [],
        keywords: res => res._keywords ?? [],
        type: res => res.compared_to_category ? res.compared_to_category : undefined,
    }

    id;
    name;
    brands;
    brandTags;
    quantity;
    imageURL;
    foodGroups;
    categories;
    allergens;
    ingredients;
    nutritionalInfo;
    countries;
    stores;
    keywords;
    type;

    get isVegan() { return this.ingredients.every(i => i.isVegan); }
    get isVegetarian() { return this.ingredients.every(i => i.isVegetarian); }

    constructor(response) {
        console.log(response);
        for (const fieldName in ProductInfo.FIELD_RESPONSE_MAPPING) {
            this[fieldName] = ProductInfo.FIELD_RESPONSE_MAPPING[fieldName](response);
        }

        Object.freeze(this);
    }

    /**
     * A numerical score that indicated how similar two products are.
     * @param {ProductInfo} product 
     * @returns {number} similarity score
     */
    getSimilarityScore(product) {
        let out = 0;

        product.brandTags.forEach(k => out += this.brandTags.includes(k) ? 3 : 0); // similar brands

        product.foodGroups.forEach(k => out += this.foodGroups.includes(k) ? 2 : 0); // similar food groups

        product.keywords.forEach(k => out += this.keywords.includes(k) ? 1 : 0); // similar keywords
        
        product.categories.forEach(k => out += this.categories.includes(k) ? .5 : 0); // similar categories

        return out;
    }

}

export class ProductIngredient {

    static UNKNOWN_INGREDIENT = {name:'Unknown', percentage:100, vegan:false, vegetarian:false};

    static FIELD_RESPONSE_MAPPING = {
        id: res => res.id,
        name: res => res.id.substring(res.id.indexOf(':')+1).replaceAll('-', ' '),
        percentage: res => res.percent ?? res.percent_estimate ?? res.percent_max ?? res.percent_min ?? 0,
        isVegan: res => res.vegan === 'yes',
        isVegetarian: res => res.vegetarian === 'yes'
    }

    id;
    name;
    percentage;
    isVegan;
    isVegetarian;

    constructor(response) {
        for (const fieldName in ProductIngredient.FIELD_RESPONSE_MAPPING) {
            this[fieldName] = ProductIngredient.FIELD_RESPONSE_MAPPING[fieldName](response);
        }

        Object.freeze(this);
    }

}


export class NutritionalInfo {

    static FIELD_RESPONSE_MAPPING = {
        nutriscore: res => (res.nutriscore_grade ?? '?').toLocaleUpperCase(),
        fat: res => res.nutrient_levels.fat ?? 'unknown',
        salt: res => res.nutrient_levels.salt ?? 'unknown',
        saturatedFat: res => res.nutrient_levels['saturated-fat']  ?? 'unknown',
        sugar: res => res.nutrient_levels.sugars ?? 'unknown'
    }
    
    nutriscore;
    fat;
    salt;
    saturatedFat;
    sugar;

    constructor(response) {
        for (const fieldName in NutritionalInfo.FIELD_RESPONSE_MAPPING) {
            this[fieldName] = NutritionalInfo.FIELD_RESPONSE_MAPPING[fieldName](response);
        }

        Object.freeze(this);
    }

}