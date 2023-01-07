import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';
import './lib/JQuery.js';

import USER_SETTINGS, { respectsAllergies, respectsDiet } from './user-settings.js';

var scanning = false;
var product = undefined;

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container'),
            constraints: {
                width: 960,
                height: 640,
                facingMode: "environment"
            },
        },
        decoder: { readers: [ "ean_reader", "ean_8_reader" ] },
        frequency: 5 // get camera at 5 fps

    }, err => {
        if (err) console.log(err);
        else {
            console.log("Initialization finished. Ready to start");
            Quagga.start();
    
            // Set flag to is running
            scanning = true;
        }

    });


}

var searchingBarcode = false; // whether the API is busy searching a code

Quagga.onDetected(result => {
    const code = result.codeResult.code;
    if (!searchingBarcode && (product === undefined || code !== product.id)) {
        searchingBarcode = true; // only call API once at a time

        OpenFoodFactsAPI.search(code)
        .then(res => { // new product found
            product = res;
            setClickBoxCode(code, respectsAllergies(res));
        })
        .catch(err => { /* Assume invalid scan, do nothing else */ })
        .finally(() => searchingBarcode = false);
    }
});

function setClickBoxCode(code, safe) {
    $('#click-box').removeClass('safe');
    $('#click-box').removeClass('unsafe');
    $('#content').removeClass('unsafe');
    $('#content').removeClass('unsafe');

    // safe may be undefined
    if (safe === true) {
        $('#click-box').addClass('safe');
        $('#content').addClass('safe');
    }
    else if (safe === false) {
        $('#click-box').addClass('unsafe');
        $('#content').addClass('unsafe');
    }

    $('#click-box').attr('code', code);

}

window.gotoScanned = function() {
    const code = $('#click-box').attr('code');

    if (code) window.location.assign(`/scanned.html?code=${code}`); // redirect
}

window.addEventListener('DOMContentLoaded', startScanner);