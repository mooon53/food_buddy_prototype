export default class LocallyStoredSet {

    #name;
    #all;
    get all() { return [...this.#all] }

    constructor(name) {
        if (typeof name !== 'string') throw new TypeError('parameter "name" must be a string.');
        this.#name = name;

        this.#all = JSON.parse(window.localStorage.getItem(this.#name) ?? '[]'); // default to empty list
    }

    add(val) {
        if (this.includes(val)) return false;

        this.#all.push(val);
        this.#save();
        return true;
    }

    remove(val) {
        if (!this.includes(val)) return false;

        this.#all = this.#all.filter(c => c !== val);
        this.#save();
        return false;
    }

    toggle(val) {
        if (this.includes(val)) {
            this.remove(val);
            return false;
        }
        else {
            this.add(val);
            return true;
        }
    }

    includes(code) {
        return this.#all.includes(code);
    }

    clear() {
        this.#all = [];
        this.#save();
    }

    #save() {
        window.localStorage.setItem(this.#name, JSON.stringify(this.#all));
    }

}