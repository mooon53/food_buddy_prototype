var scanning = false;
var previousCode = undefined;
import OpenFoodFactsAPI from './OpenFoodFactsAPI.js';

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

    }, err => {
        if (err) console.log(err);
        else {
            console.log("Initialization finished. Ready to start");
            Quagga.start();
    
            // Set flag to is running
            scanning = true;
        }

    });


    Quagga.onDetected(result => {
        const code = result.codeResult.code;
        if (code !== previousCode) {
            previousCode = code;
            OpenFoodFactsAPI.search(code)
            .then(res => alert(res.name))
            .catch(err => alert(err));
        }
    });
}

window.addEventListener('DOMContentLoaded', startScanner);