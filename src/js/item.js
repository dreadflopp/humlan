/* eslint-disable no-underscore-dangle,no-trailing-spaces */
class Item {
    /**
     *
     * @param {number} seller
     * @param {number} price
     * @param {number} discount
     */
    constructor(seller, price, discount) {
        this._seller = seller;
        this._price = price;
        this._discount = discount;
    }

    /**
     *
     * @returns {number}
     */
    get seller() {
        return this._seller;
    }

    /**
     *
     * @param {number} value
     */
    set seller(value) {
        this._seller = value;
    }

    /**
     *
     * @returns {number}
     */
    get price() {
        return this._price;
    }

    /**
     *
     * @param {number} value
     */
    set price(value) {
        this._price = value;
    }

    /**
     *
     * @returns {number}
     */
    get discount() {
        return this._discount;
    }

    /**
     *
     * @param {number} value
     */
    set discount(value) {
        this._discount = value;
    }

    /**
     *
     * @returns {number}
     */
    discountedPrice() {
        return this._price - ((this._price * this._discount) / 100);
    }
}

module.exports = Item;
