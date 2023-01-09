import LocallyStoredSet from './LocallyStoredSet.js';

var USER_SETTINGS = {
    personalInfo: {
        name: 'Edward van der Wal',
        email: 'edward.vanderwal@gmail.com'
    },
    diet: {
        low: ['salt'], // user wants to consume low amounts of ...
        high: ['fat'], // user wants to consume high amounts of ...
        isVegetarian: false,
        isVegan: false
    },
    allergies: new LocallyStoredSet('saved-allergies').all // list of banned allergen IDs
};
Object.seal(USER_SETTINGS);

export default USER_SETTINGS;

export function respectsAllergies(product) {
    return product.allergens.every(a => !USER_SETTINGS.allergies.includes(a));
}

export function respectsDiet(product) {
    return (!USER_SETTINGS.diet.isVegan || product.isVegan) // respects veganism
        || (!USER_SETTINGS.diet.isVegetarian || product.isVegetarian) // respect vegetarianism
        || USER_SETTINGS.diet.low.some(n => product.nutritionalInfo[n] !== 'low') // all nutrients in low are low in product
        || USER_SETTINGS.diet.high.some(n => product.nutritionalInfo[n] !== 'high') // all nutrients in high are high in product
}