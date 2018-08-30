/* eslint-disable no-underscore-dangle,no-trailing-spaces */
class Receipt {

    /**
     *
     * @param {Item[]} items
     * @param {String} time
     */
    constructor(items, time) {
        this._time = time;
        this._items = items;
    }

    /**
     *
     * @returns {Item[]}
     */
    get items() {
        return this._items;
    }

    /**
     *
     * @param {Item[]} value
     */
    set items(value) {
        this._items = value;
    }

    /**
     *
     * @returns {string}
     */
    get time() {
        return this._time;
    }

    /**
     *
     * @param {string} value
     */
    set time(value) {
        this._time = value;
    }

    /**
     *
     * @returns {number}
     */
    getSum() {
        let sum = 0;
        this._items.forEach((item) => {
            sum += item.discountedPrice();
        });

        return sum;
    }

    /**
     *
     * @param {Item} item
     */
    addItem(item) {
        this._items.push(item);
    }

    /**
     *
     * @param {number} index
     * @returns {boolean}
     */
    removeItem(index) {
        if (index < this._items.length && index > -1) {
            this._items.splice(index, 1);
            return true;
        }

        return false;
    }

    length() {
        return this._items.length;
    }

    clear() {
        this._items.length = 0;
        this._time = '';
    }

    toConsole() {
        this._items.forEach((item) => {
// eslint-disable-next-line no-console
            console.log(`Seller: ${item.seller} price: ${item.price} discount: ${item.discount} \n`);
        });
    }

    autoTime() {
        this._time = new Date().toLocaleString('sv-SE');
    }
}

module.exports = Receipt;
