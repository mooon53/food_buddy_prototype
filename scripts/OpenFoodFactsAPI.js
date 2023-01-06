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

}

class ProductInfo {
    
    #id;
    get id() { return this.#id; }
    #name;
    get name() { return this.#name; }
    #imageURL;
    get imageURL() { return this.#imageURL }
    #categories;
    get categories() { return this.#categories; }
    #allergens;
    get allergens() { return this.#allergens; }
    #ingredients;
    get ingredients() { return this.#ingredients; }
    #nutritionalInfo;
    get nutritionalInfo() { return this.#nutritionalInfo; }

    constructor(id, name, imageURL, categories, allergens, ingredients, nutritionalInfo) {
        this.#id = id;
        this.#name = name;
        this.#imageURL = imageURL
        this.#categories = categories;
        this.#allergens = allergens;
        this.#ingredients = ingredients;
        this.#nutritionalInfo = nutritionalInfo;
    }

    static fromJSONResponse(res) {
        return new ProductInfo(
            res.code,
            OpenFoodFactsAPI.LANGUAGE_PREFERENCE.reduce(
                (val, lang) => val ?? res['product_name_'+lang],
                undefined
            ),
            res.image_front_url,
            res.food_groups_tags,
            res.allergens_tags,
            res.ingredients.map(ProductIngredient.fromJSONResponse),
            NutritionalInfo.fromJSONResponse(res)
        );
    }

}

class ProductIngredient {

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
        return new ProductIngredient(
            res.id,
            res.text,
            res.percent ?? res.percent_estimate ?? res.percent_max ?? res.percent_min,
            res.vegan === 'yes',
            res.vegetarian === "yes"
        );
    }

}


class NutritionalInfo {

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
            res.nutriscore_grade,
            res.nutrient_levels.fat,
            res.nutrient_levels.salt,
            res.nutrient_levels.saturatedFat,
            res.nutrient_levels.sugar
        );
    }

}