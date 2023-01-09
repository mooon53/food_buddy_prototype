import './lib/JQuery.js'
import LocallyStoredSet from './LocallyStoredSet.js';

const SAVED_ALLERGIES = new LocallyStoredSet('saved-allergies');

const POSSIBLE_ALLERGIES = [
    'en:peanuts',
    'en:soy',
    'en:dairy'
];

POSSIBLE_ALLERGIES.sort((a,b) => a.localeCompare(b));

window.addEventListener('DOMContentLoaded', () => {
    POSSIBLE_ALLERGIES.forEach(a => {
        $(`<h2 class="allergy-option" onclick="toggleAllergy('${a}',this)">Allergic to ${a.substring(3)}? ${SAVED_ALLERGIES.includes(a) ? 'yes' : 'no'}</h2>`)
        .addClass(SAVED_ALLERGIES.includes(a) ? 'enabled' : 'disabled')
        .appendTo('#content');
    });
});

window.toggleAllergy = function(allergy, elem) {
    $(elem).toggleClass('enabled');
    $(elem).toggleClass('disabled');
    if (SAVED_ALLERGIES.toggle(allergy)) elem.innerText = `Allergic to ${allergy.substring(3)}? yes`;
    else elem.innerText = `Allergic to ${allergy.substring(3)}? no`;
}