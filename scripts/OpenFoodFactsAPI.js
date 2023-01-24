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
                        else resolve(ProductInfo.fromJSONResponse(res.products[0]));
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
                        resolve(res.products.map(ProductInfo.fromJSONResponse));
                    }
                    else reject(`Could not fetch resource: ${this.responseText}`);
                }
            }

            let url = `${this.#API_URL_BASE}/search?`;
            if (ALLERGIES.length > 0) url += 'allergens_tags=' + ALLERGIES.map(a => '-' + a).join(',') + '&';
            if (product.categories.length > 0) url += 'food_groups_tags=' + product.categories.join(',');

            req.open('GET', url, true);
            req.send();
        });
    }

}

export class ProductInfo {
    
    #id;
    get id() { return this.#id; }
    #name;
    get name() { return this.#name; }
    #brands;
    get brands() { return this.#brands; }
    #quantity;
    get quantity() { return this.#quantity; }
    #imageURL;
    get imageURL() { return this.#imageURL }
    #categories;
    get categories() { return this.#categories; }
    #allergens;
    get allergens() { return this.#allergens; }
    #ingredients;
    /** @returns {Array<ProductIngredient>} */
    get ingredients() { return this.#ingredients; }
    #nutritionalInfo;
    /** @returns {NutritionalInfo} */
    get nutritionalInfo() { return this.#nutritionalInfo; }

    get isVegan() { return this.ingredients.every(i => i.isVegan); }
    get isVegetarian() { return this.ingredients.every(i => i.isVegetarian); }

    constructor(id, name, brands, quantity, imageURL, categories, allergens, ingredients, nutritionalInfo) {
        this.#id = id;
        this.#brands = brands;
        this.#name = name;
        this.#quantity = quantity;
        this.#imageURL = imageURL
        this.#categories = categories;
        this.#allergens = allergens;
        this.#ingredients = ingredients;

        this.#ingredients.sort((a,b) => b.percentage - a.percentage); // sort ingredient by percentage (high -> low)
        Object.freeze(this.#ingredients);
        
        this.#nutritionalInfo = nutritionalInfo;
        Object.freeze(this.#nutritionalInfo);
    }

    static fromJSONResponse(res) {
        console.log(res);
        let name = undefined;
        for (const lang of OpenFoodFactsAPI.LANGUAGE_PREFERENCE) {
            const langName = res['product_name_'+lang];
            if (langName !== undefined && langName.length > 0) {
                name = langName;
                break;
            }
        }
        name = name ?? 'Unknown Product';

        return new ProductInfo(
            res.code,
            name,
            res.brands ?? '',
            res.quantity ?? '??? grams',
            res.image_front_url ?? '/images.icons/account.svg',
            res.food_groups_tags ?? [],
            res.allergens_tags ?? [],
            (res.ingredients ?? [ProductIngredient.UNKNOWN_INGREDIENT]).map(ProductIngredient.fromJSONResponse),
            NutritionalInfo.fromJSONResponse(res)
        );
    }

}

export class ProductIngredient {

    static get UNKNOWN_INGREDIENT() {
        return {
            id: 'unknown',
            name: 'Unknown',
            percent: 100,
            vegan:false,
            vegetarian: false
        };
    }

    #id;
    get id() { return this.#id; }
    #name;
    get name() { return this.#name; }
    #percentage;
    get percentage() { return this.#percentage; }
    #isVegan;
    get isVegan() { return this.#isVegan; }
    #isVegetarian;
    get isVegetarian() { return this.#isVegetarian; }

    constructor(id, name, percentage, isVegan, isVegetarian) {
        this.#id = id;
        this.#name = name;
        this.#percentage = percentage;
        this.#isVegan = isVegan;
        this.#isVegetarian = isVegetarian;
    }

    static fromJSONResponse(res) {
        const name = res.id.substring(res.id.indexOf(':')+1).replaceAll('-', ' ');

        return new ProductIngredient(
            res.id,
            name.charAt(0).toLocaleUpperCase() + name.substring(1),
            res.percent ?? res.percent_estimate ?? res.percent_max ?? res.percent_min ?? 0,
            res.vegan === 'yes',
            res.vegetarian === "yes"
        );
    }

}


export class NutritionalInfo {

    #nutriscore;
    get nutriscore() { return this.#nutriscore; }
    #fat;
    get fat() { return this.#fat; }
    #salt;
    get salt() { return this.#salt; }
    #saturatedFat;
    get saturatedFat() { return this.#saturatedFat; }
    #sugar;
    get sugar() { return this.#sugar; }

    constructor(nutriscore, fat, salt, saturatedFat, sugar) {
        this.#nutriscore = nutriscore;
        this.#fat = fat;
        this.#salt = salt;
        this.#saturatedFat = saturatedFat;
        this.#sugar = sugar;
    }

    static fromJSONResponse(res) {
        return new NutritionalInfo(
            (res.nutriscore_grade ?? '?').toLocaleUpperCase(),
            res.nutrient_levels.fat ?? 'unknown',
            res.nutrient_levels.salt ?? 'unknown',
            res.nutrient_levels['saturated-fat']  ?? 'unknown',
            res.nutrient_levels.sugars ?? 'unknown'
        );
    }

}