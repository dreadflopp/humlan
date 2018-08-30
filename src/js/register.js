/* eslint-disable no-underscore-dangle,no-trailing-spaces */
const Item = require('./item');
const Receipt = require('./receipt');

class Register {
    constructor() {
        this._seller = false;
        this._price = false;
        this._discount = false;
    }

    /**
     *
     * @returns {boolean|string}
     */
    get seller() {
        return this._seller;
    }

    /**
     *
     * @param {boolean|string} value
     */
    set seller(value) {
        this._seller = value;
    }

    /**
     *
     * @returns {boolean|string}
     */
    get price() {
        return this._price;
    }

    /**
     *
     * @param {boolean|string} value
     */
    set price(value) {
        this._price = value;
    }

    /**
     *
     * @returns {boolean|string}
     */
    get discount() {
        return this._discount;
    }

    /**
     *
     * @param {boolean|string} value
     */
    set discount(value) {
        this._discount = value;
    }

    /**
     *
     * @returns {boolean}
     */
    validateSeller() {
        if (this._seller) {
            this._seller = this._seller.trim();
            if (/^[1-9][0-9]*$/.test(this._seller)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @returns {boolean}
     */
    validatePrice() {
        if (this._price) {
            this._price = this._price.trim();
            if (/^[0-9]+([.|,][0-9]{1,2})?$/.test(this._price)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @returns {boolean}
     */
    validateDiscount() {
        if (this._discount) {
            this._discount = this._discount.trim();
            if (/^[1-9][0-9]*$/.test(this._discount)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {number} index
     */
    removeItem(index) {
        this._receipt.removeItem(index);
    }

    reset() {
        this._seller = false;
        this._price = false;
        this._discount = false;
    }

    getItem() {
        if (this._seller && this._price && this._discount) {
            const item = new Item(this._seller, this._price, this._discount);
            this.reset();
            return item;
        }

        this.reset();
        return false;
    }
}

module.exports = Register;
