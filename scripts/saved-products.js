export default class SavedProducts {

    static all = JSON.parse(window.localStorage.getItem('saved-products') ?? '[]'); // default to empty list

    static add(code) {
        this.all.push(code);
        this.#save();
    }

    static remove(code) {
        this.all = this.all.filter(c => c !== code);
        this.#save();
    }

    static toggle(code) {
        if (this.includes(code)) {
            this.remove(code);
            return false;
        }
        else {
            this.add(code);
            return true;
        }
    }

    static includes(code) {
        return this.all.includes(code);
    }

    static clear() {
        this.all = [];
        this.#save();
    }

    static #save() {
        window.localStorage.setItem('saved-products', JSON.stringify(this.all));
    }

}