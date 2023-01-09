document.addEventListener('DOMContentLoaded', function() {
    $(document.head).append(`<link rel="stylesheet" href="/styles/elements/product-entry-style.css" type="text/css" />`);
});

export default class ProductEntry extends HTMLElement {

    #product;

    /**
     * Creates a new ProductEntry element.
     * @param {ProductInfo} product 
     */
    constructor(product) {
        super();

        this.#product = product;

        this.innerHTML = `
            <img src="${product.imageURL}" alt="${product.name}">
            <h2><a href="/scanned.html?code=${product.id}">${product.name}</a></h2>
        `;
    }

}

customElements.define('product-entry', ProductEntry);