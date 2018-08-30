/* eslint-disable no-underscore-dangle,no-trailing-spaces */
const log = require('./log');
const Receipt = require('./receipt');
const Item = require('./item');

class ReceiptStorage {
    constructor() {
        /**
         *
         * @type {Receipt[]}
         * @private
         */
        this._receipts = [];
        log('Receipt storage constructor');
    }

    /**
     *
     * @returns {Receipt[]}
     */
    get receipts() {
        return this._receipts;
    }

    /**
     *
     * @param {Receipt[]} value
     */
    set receipts(value) {
        this._receipts = value;
    }

    getReceipt(index) {
        return this._receipts[index];
    }

    /**
     *
     * @param {Receipt} receipt
     */
    addReceipt(receipt) {
        this._receipts.push(receipt);
    }

    /**
     *
     * @param {number} index
     * @returns {Receipt|boolean}
     */
    returnReceipt(index) {
        if (index < this._receipts.length && index > -1) {
            const receipt = this._receipts[index];
            const items = [];
            const time = receipt.time;
            receipt.items.forEach((item) => {
                const seller = item.seller;
                const price = item.price;
                const discount = item.discount;
                items.push(new Item(seller, price, discount));
            });

            this._receipts.splice(index, 1);
            return new Receipt(items, time);
        }

        return false;
    }

    toConsole() {
        console.log('---------------------');
        this._receipts.forEach((receipt) => {
            receipt.toConsole();
        });
        console.log('---------------------');
    }
}

module.exports = ReceiptStorage;
