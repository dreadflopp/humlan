/* eslint-disable no-trailing-spaces,no-underscore-dangle,func-names */
const financial = require('./financial');
const log = require('./log');
const Receipt = require('./receipt');
const Item = require('./item');
const Register = require('./register');
const ReceiptStorage = require('./receiptStorage');
const fs = require('fs');

const filename = 'humlan_sparade_kvitton';

const userInterface = (function () {
    const register = new Register();
    const receiptStorage = new ReceiptStorage();
    const purchaseReceipt = new Receipt([], '');
    let historyReceipt = new Receipt([], '');

    const updateSumNode = function (receiptId) {
        // get receipt-node
        const receiptNode = document.getElementById(receiptId);

        // get all items
        const itemsNode = receiptNode.getElementsByClassName('item');
        const items = [];
        Array.from(itemsNode).forEach((item) => {
            const seller = Number(item.getElementsByClassName('seller'[0]).innerText);
            const price = Number(item.getElementsByClassName('price')[0].innerText);
            const discount = Number(item.getElementsByClassName('discount')[0].innerText);
            items.push(new Item(seller, price, discount));
        });

        // calculate sum
        let sum = 0;

        items.forEach((item) => {
            sum += item.discountedPrice();
        });

        // update sum-node
        const sumField = receiptNode.getElementsByClassName('receipt-sum')[0];
        sumField.innerText = financial(sum);
    };

    const updateReceipt = function (receiptId) {
        // Get nodes and elements
        const receiptNode = document.getElementById(receiptId);
        const itemsNode = receiptNode.getElementsByClassName('item');
        const editArea = receiptNode.getElementsByClassName('receipt-edit-area')[0];
        const editButton = receiptNode.getElementsByClassName('receipt-edit-button')[0];
        const doneButton = receiptNode.getElementsByClassName('receipt-done-button')[0];
        const deleteButton = receiptNode.getElementsByClassName('receipt-delete-button')[0];
        const sumContainer = receiptNode.getElementsByClassName('sum-container')[0];
        const sumField = receiptNode.getElementsByClassName('receipt-sum')[0];
        const placeholder = receiptNode.getElementsByClassName('receipt-placeholder')[0];

        // reset the edit area
        if (receiptNode.getElementsByClassName('receipt-edit-area').length > 0) {
            editArea.classList.add('hidden');
            editButton.classList.remove('hidden');
            doneButton.classList.add('hidden');
            deleteButton.classList.add('hidden');
        }

        // Hide all delete buttons
        const deleteItemButtons = receiptNode.getElementsByClassName('delete-item-button');
        Array.from(deleteItemButtons).forEach((button) => {
            button.classList.add('hidden');
        });

        // Count the number of items on the receipt
        const itemCount = Array.from(itemsNode).length;

        // If receipt isn't empty
        if (itemCount > 0) {
            // Hide placeholder
            placeholder.classList.add('hidden');

            // Update sum
            updateSumNode(receiptId);
            sumContainer.classList.remove('hidden');

            // Show edit area
            if (receiptNode.getElementsByClassName('receipt-edit-area').length > 0) {
                editArea.classList.remove('hidden');
            }
        } else {
            // receipt is empty
            // Show placeholder
            placeholder.classList.remove('hidden');

            // update sum-node
            sumContainer.classList.add('hidden');
            sumField.innerText = '';
        }
    };

    const deleteItemButtonHandler = function () {
        // Get nodes
        const itemNode = this.parentNode.parentNode.parentNode.parentNode;
        const receiptId = itemNode.parentNode.parentNode.id;
        const receipt = document.getElementById(receiptId);

        // calculate object index and delete item
        const parent = itemNode.parentNode;
        const indexInNode = Array.prototype.indexOf.call(parent.children, itemNode);
        log(`Index of item in node that will be deleted from purchase object: ${indexInNode}`);
        if (receiptId === 'receipt') {
            const indexInObject = purchaseReceipt.length() - indexInNode - 1;
            log(`Index of item to delete from purchase object: ${indexInObject}`);
            purchaseReceipt.removeItem(indexInObject);
        } else if (receiptId === 'history-receipt') {
            const indexInObject = historyReceipt.length() - indexInNode - 1;
            log(`Index of item to delete from history object: ${indexInObject}`);
            historyReceipt.removeItem(indexInObject);
        }

        // Delete node
        itemNode.parentNode.removeChild(itemNode);

        // if receipt still has items, calculate sum
        if (receipt.getElementsByClassName('item').length > 0) {
            updateSumNode(receiptId);
        } else {
            updateReceipt(receiptId);
            // Hide add-to-history button
            document.getElementById('add-to-history-container').classList.add('hidden');
        }
    };

    /**
     *
     * @param {Item} item
     * @returns {HTMLDivElement}
     */
    const itemNodeBuilder = function (item) {
        // item related elements
        const itemNode = document.createElement('div');
        itemNode.classList.add('item');

        // create rows
        const firstRow = document.createElement('div');
        firstRow.classList.add('receiptFirstRow');
        const secondRow = document.createElement('div');
        secondRow.classList.add('receiptSecondRow');
        itemNode.appendChild(firstRow);
        itemNode.appendChild(secondRow);

        // create divs in rows to style text and ammount
        const firstRowLeft = document.createElement('div');
        firstRowLeft.classList.add('left');
        const firstRowRight = document.createElement('div');
        firstRowRight.classList.add('right');
        const secondRowLeft = document.createElement('div');
        secondRowLeft.classList.add('left');
        const secondRowRight = document.createElement('div');
        secondRowRight.classList.add('right');
        firstRow.appendChild(firstRowLeft);
        firstRow.appendChild(firstRowRight);
        secondRow.appendChild(secondRowLeft);
        secondRow.appendChild(secondRowRight);

        // create first row elements
        // Create delete-item-button
        const deleteItemButton = document.createElement('button');
        deleteItemButton.classList.add('delete-item-button');
        deleteItemButton.classList.add('hidden');
        deleteItemButton.innerHTML = '&#x2715';
        deleteItemButton.addEventListener('click', deleteItemButtonHandler, false);
        const deleteButtonContainer = document.createElement('div');
        deleteButtonContainer.classList.add('delete-item-button-container');
        deleteButtonContainer.appendChild(deleteItemButton);
        firstRowLeft.appendChild(deleteButtonContainer);

        const sellerDesc = document.createElement('span');
        sellerDesc.innerText = 'Säljare ';
        firstRowLeft.appendChild(sellerDesc);

        const seller = document.createElement('span');
        seller.innerText = String(item.seller);
        seller.classList.add('seller');
        firstRowLeft.appendChild(seller);

        const priceSign = document.createElement('span');
        priceSign.innerText = '+';
        firstRowRight.appendChild(priceSign);

        const price = document.createElement('span');
        price.innerText = financial(item.price);
        price.classList.add('price');
        firstRowRight.appendChild(price);

        // create second row elements
        const discountDescPre = document.createElement('span');
        discountDescPre.innerText = '    *** Rabatt ';
        secondRowLeft.appendChild(discountDescPre);

        const discountPercent = document.createElement('span');
        discountPercent.innerText = String(item.discount);
        discountPercent.classList.add('discount');
        secondRowLeft.appendChild(discountPercent);

        const discountDescPost = document.createElement('span');
        discountDescPost.innerText = '% ***   ';
        secondRowLeft.appendChild(discountDescPost);

        const discountSign = document.createElement('span');
        discountSign.innerText = '-';
        secondRowRight.appendChild(discountSign);

        const discount = document.createElement('span');
        discount.innerText = financial(item.price - item.discountedPrice());
        secondRowRight.appendChild(discount);

        // Hide second row if discount equals 0
        if (Number(item.discount) === 0) {
            secondRow.classList.add('hidden');
        }

        return itemNode;
    };

    const showReturnButton = function () {
        // Show return button
        document.getElementById('return-button').classList.remove('hidden');
    };


    const addItemsToPurchaseReceiptNode = function () {
        // Count elements in receipt node and receipt object
        const elementsInObject = purchaseReceipt.length();
        const elementsInNode = Array.from(document.getElementById('receipt').getElementsByClassName('item')).length;
        let elementsToAddCount = elementsInObject - elementsInNode;

        // Get receipt node
        const receiptNode = document.getElementById('receipt');

        // get content node
        const contentNode = receiptNode.getElementsByClassName('receiptContent')[0];

        while (elementsToAddCount > 0) {
            // Get item
            const item = purchaseReceipt.items[elementsInObject - elementsToAddCount];

            // create item-node
            const itemNode = itemNodeBuilder(item);

            // append item node
            contentNode.insertBefore(itemNode, contentNode.firstChild);

            // decrease counter
            elementsToAddCount -= 1;
        }
    };

    const addItemsToHistoryReceiptNode = function () {
        // Get receipt node
        const receiptNode = document.getElementById('history-receipt');

        // get content node
        const contentNode = receiptNode.getElementsByClassName('receiptContent')[0];

        // clear receipt node
        while (contentNode.firstChild) {
            contentNode.removeChild(contentNode.firstChild);
        }

        // Count elements in receipt node and receipt object
        const elementsInObject = historyReceipt.length();
        const elementsInNode = Array.from(document.getElementById('history-receipt').getElementsByClassName('item')).length;
        let elementsToAddCount = elementsInObject - elementsInNode;

        while (elementsToAddCount > 0) {
            // Get item
            const item = historyReceipt.items[elementsInObject - elementsToAddCount];

            // create item-node
            const itemNode = itemNodeBuilder(item);

            // append item node
            contentNode.insertBefore(itemNode, contentNode.firstChild);

            // decrease counter
            elementsToAddCount -= 1;
        }
    };

    const removeSellerInvalidMarker = function () {
        document.getElementById('seller').classList.remove('invalid');
        document.getElementsByClassName('invalid-marker')[0].classList.add('hidden');
    };

    const addSellerInvalidMarker = function () {
        document.getElementById('seller').classList.add('invalid');
        document.getElementsByClassName('invalid-marker')[0].classList.remove('hidden');
    };

    const removePriceInvalidMarker = function () {
        document.getElementById('price').classList.remove('invalid');
        document.getElementsByClassName('invalid-marker')[1].classList.add('hidden');
    };

    const addPriceInvalidMarker = function () {
        document.getElementById('price').classList.add('invalid');
        document.getElementsByClassName('invalid-marker')[1].classList.remove('hidden');
    };

    const removeDiscountInvalidMarker = function () {
        document.getElementById('discount').classList.remove('invalid');
        document.getElementsByClassName('invalid-marker')[2].classList.add('hidden');
    };

    const addDiscountInvalidMarker = function () {
        document.getElementById('discount').classList.add('invalid');
        document.getElementsByClassName('invalid-marker')[2].classList.remove('hidden');
    };

    const validateSeller = function () {
        if (register.validateSeller()) {
            removeSellerInvalidMarker();
            return true;
        } 
        addSellerInvalidMarker();
        return false;
    };

    const validatePrice = function () {
        if (register.validatePrice()) {
            removePriceInvalidMarker();
            return true;
        } 
        addPriceInvalidMarker();
        return false;
    };

    const validateDiscount = function () {
        const isDiscountedElement = document.getElementById('is-discounted');

        // Validate discounted
        if (isDiscountedElement.checked) {
            if (register.validateDiscount()) {
                removeDiscountInvalidMarker();
                return true;
            } 
            addDiscountInvalidMarker();
            return false;
        } 
        return true;
    };

    const receiptSelectedHandler = function () {
        // Un-hide the selected receipt area
        document.getElementById('history-receipt').classList.remove('transparent');

        // Get index of selected container
        const selected = this.parentNode;

        // Calculate index
        const parent = selected.parentNode;
        const indexInNode = Array.prototype.indexOf.call(parent.children, selected);
        const indexInObject = document.getElementsByClassName('radio-button-container').length - indexInNode - 1;
        // Get items
        historyReceipt = receiptStorage.getReceipt(indexInObject);

        // Populate receipt node with items
        addItemsToHistoryReceiptNode();

        // Update receipt
        updateReceipt('history-receipt');

        // Show return button
        showReturnButton();
    };

    const addRadioButton = function (title) {
        // Hide placeholder
        const placeholder = document.getElementById('history-list-placeholder');
        placeholder.classList.add('hidden');

        const radioLabel = document.createElement('label');
        radioLabel.classList.add('radio-button-container');
        radioLabel.innerText = title;
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'chosen-receipt';
        const thisReceiptsIndex = document.getElementsByClassName('receipt-list-element').length;
        radioInput.classList.add('receipt-list-element');
        radioInput.id = String(thisReceiptsIndex);
        const checkmark = document.createElement('span');
        checkmark.classList.add('checkmark-radio');
        radioLabel.appendChild(radioInput);
        radioLabel.appendChild(checkmark);

        const radioButtons = document.getElementById('receipt-radio-buttons');
        radioButtons.insertBefore(radioLabel, radioButtons.firstChild);

        // Create event listener
        radioInput.addEventListener('click', receiptSelectedHandler, false);

        // clear receipt
        updateReceipt('receipt');

        // Hide add-to-history button
        document.getElementById('add-to-history-container').classList.add('hidden');
    };

    const getSelectedReceipt = function () {
        // Get all radio buttons
        const radioButtons = document.getElementById('receipt-radio-buttons');

        // Selected node
        let selectedNode = false;

// eslint-disable-next-line no-restricted-syntax
        for (const button of radioButtons) {
            if (button.checked) {
                selectedNode = button.parentNode;
                break;
            }
        }
        return selectedNode;
    };

    const editButtonHandler = function () {
        // Hide edit button
        this.classList.add('hidden');

        // Show done button
        const doneButton = this.parentNode.getElementsByClassName('receipt-done-button')[0];
        doneButton.classList.remove('hidden');

        // Show delete button
        const deleteButton = this.parentNode.parentNode.getElementsByClassName('receipt-delete-button')[0];
        deleteButton.classList.remove('hidden');

        // Show delete item buttons
        const receiptId = this.parentNode.parentNode.parentNode.id;
        const receipt = document.getElementById(receiptId);
        const deleteItemButtons = receipt.getElementsByClassName('delete-item-button');
        Array.from(deleteItemButtons).forEach((button) => {
            button.classList.remove('hidden');
        });
    };

    const doneButtonHandler = function () {
        // Get receipt id
        const receiptId = this.parentNode.parentNode.parentNode.id;

        // Reset edit area
        updateReceipt(receiptId);
    };

    const deleteButtonHandler = function () {
        // Get receipt id
        const receiptId = this.parentNode.parentNode.parentNode.id;
        log(`Id of receipt to delete: ${receiptId}`);

        // Clear receipt object
        if (receiptId === 'receipt') {
            purchaseReceipt.clear();
        } else if (receiptId === 'history-receipt') {
            historyReceipt.clear();
        }

        // clear receipt node
        const contentNode = document.getElementById(receiptId).getElementsByClassName('receiptContent')[0];
        while (contentNode.firstChild) {
            contentNode.removeChild(contentNode.firstChild);
        }

        // Update receipt
        updateReceipt(receiptId);

        // Hide add-to-history button
        document.getElementById('add-to-history-container').classList.add('hidden');
    };

    const focusResetHandler = function () {
        const seller = document.getElementById('seller');
        seller.focus();
    };

    const resetForm = function () {
        // DOM elements
        const sellerElement = document.getElementById('seller');
        const priceElement = document.getElementById('price');
        const discountElement = document.getElementById('discount');
        const isDiscountedElement = document.getElementById('is-discounted');

        // empty form
        sellerElement.value = '';
        priceElement.value = '';
        discountElement.value = '50';
        isDiscountedElement.checked = false;
        sellerElement.focus();

        // reset invalid markers
        removeSellerInvalidMarker();
        removePriceInvalidMarker();
        removeDiscountInvalidMarker();
    };

    const addToHistoryHandler = function () {
        if (purchaseReceipt.length() > 0) {
            // Add items to new receipt in history
            const dateString = new Date().toLocaleString('sv-SE');
            purchaseReceipt.time = dateString;
            const items = [];
            purchaseReceipt.items.forEach((item) => {
                const seller = item.seller;
                const price = item.price;
                const discount = item.discount;
                items.push(new Item(seller, price, discount));
            });
            receiptStorage.addReceipt(new Receipt(items, dateString));

            // add radio button
            addRadioButton(dateString);

            // Clear receipt node
            const contentNode = document.getElementById('receipt').getElementsByClassName('receiptContent')[0];
            while (contentNode.firstChild) {
                contentNode.removeChild(contentNode.firstChild);
            }

            // Create a backup
            fs.copyFile(`${filename}.json`, `${filename}_kopia_${dateString}.json`, (err) => {
                if (err) {
// eslint-disable-next-line no-alert
                    alert('File error: Misslyckades skapa säkerhetskopia till hårddisken. Starta om programmet och kontrollera att alla kvitton är sparade');
                } else {
                    log('Backup created!');
                }
            });

            // save to disk
            fs.writeFile(`${filename}.json`, JSON.stringify(receiptStorage.receipts), (err) => {
                if (err) {
// eslint-disable-next-line no-alert
                    alert('File error: Misslyckades spara kvitton till hårddisken. Starta om programmet och kontrollera att alla kvitton är sparade');
                } else {
                    log('File saved!');
                }
            });

            // Clear receipt object
            purchaseReceipt.clear();

            // update receipt node
            updateReceipt('receipt');

            // clear form
            resetForm();
        }
    };

    const closeButtonHandler = function () {
        // reset receipt
        updateReceipt('history-receipt');

        // Hide receipt
        document.getElementById('history-receipt').classList.add('transparent');

        // uncheck all radio buttons
        const allRadioButtons = document.getElementsByClassName('receipt-list-element');
        Array.from(allRadioButtons).forEach((button) => {
// eslint-disable-next-line no-param-reassign
            button.checked = false;
        });

        // Hide return button
        document.getElementById('return-button').classList.add('hidden');
    };

    const addItemButtonHandler = function () {
        // DOM elements
        const sellerElement = document.getElementById('seller');
        const priceElement = document.getElementById('price');
        const discountElement = document.getElementById('discount');
        const isDiscountedElement = document.getElementById('is-discounted');

        // values
        register.seller = sellerElement.value;
        register.price = priceElement.value;
        register.discount = '0';
        if (isDiscountedElement.checked) {
            register.discount = discountElement.value;
        }

        // Parse values and update fields error message if necessary
        const validSeller = validateSeller();
        const validPrice = validatePrice();
        const validDiscount = validateDiscount();

        // If everything is ok, add a new item to the receipt and update the receipt
        if (validSeller && validPrice && validDiscount) {
            const item = register.getItem();
            if (item === false) {
                log('Error creating item!');
            } else {
                purchaseReceipt.addItem(item);
            }


            // Show add to history button
            document.getElementById('add-to-history-container').classList.remove('hidden');

            // empty form
            resetForm();

            // add items to receipt node
            addItemsToPurchaseReceiptNode();

            // update receipt format
            updateReceipt('receipt');
        }
    };

    const returnReceipt = function () {
        if (purchaseReceipt.length() === 0) {
            const selected = getSelectedReceipt(); // receipt radio button container
            const parent = document.getElementById('receipt-radio-buttons');

            // Calculate index
            const indexInNode = Array.prototype.indexOf.call(parent.children, selected);
            const indexInObject = document.getElementsByClassName('radio-button-container').length - indexInNode - 1;

            // Remove receipt from receiptStorage
            const receipt = receiptStorage.returnReceipt(indexInObject);

            // Remove receipt from node
            parent.removeChild(selected);

            // close receipt
            closeButtonHandler();

            // Add receipt to register
            purchaseReceipt.clear();
            purchaseReceipt.time = receipt.time;

            receipt.items.forEach((item) => {
                const seller = item.seller;
                const price = item.price;
                const discount = item.discount;
                purchaseReceipt.addItem(new Item(seller, price, discount));
            });

            addItemsToPurchaseReceiptNode();
            updateReceipt('receipt');

            // Show purchase done button
            document.getElementById('add-to-history-container').classList.remove('hidden');

            // if receipt list is empty, show placeholder
            const receiptListEntries = document.getElementsByClassName('radio-button-container');
            if (receiptListEntries.length === 0) {
                document.getElementById('history-list-placeholder').classList.remove('hidden');
            }

            // Create a backup
            const dateString = new Date().toLocaleString('sv-SE');
            fs.copyFile(`${filename}.json`, `${filename}_kopia_${dateString}.json`, (err) => {
                if (err) {
// eslint-disable-next-line no-alert
                    alert('File error: Misslyckades skapa säkerhetskopia till hårddisken. Starta om programmet och kontrollera att alla kvitton är sparade');
                } else {
                    log('Backup created!');
                }
            });

            // save to disk
            fs.writeFile(`${filename}.json`, JSON.stringify(receiptStorage.receipts), (err) => {
                if (err) {
// eslint-disable-next-line no-alert
                    alert('File error: Misslyckades spara kvitton till hårddisken. Starta om programmet och kontrollera att alla kvitton är sparade');
                } else {
                    log('File saved!');
                }
            });
        } else {
// eslint-disable-next-line no-alert
            alert('Du måste Slutföra hanteringen av kvittot i kassan innan du returnerar ett kvitto.');
        }
    };

    const isDiscountedCheckboxHandler = function () {
        const checkbox = document.getElementById('is-discounted');
        const discountField = document.getElementById('discount');

        if (checkbox.checked === true) {
            discountField.classList.remove('inactive');
            discountField.readOnly = false;
        } else {
            discountField.classList.add('inactive');
            discountField.readOnly = true;
            removeDiscountInvalidMarker();
        }
    };

    const init = function () {
        // Load save file
        if (fs.existsSync(`${filename}.json`)) {
            log('Found save file!');
            const receipts = JSON.parse(fs.readFileSync(`${filename}.json`, 'utf8'));
            receipts.forEach((value) => {
                const time = value._time;
                const items = [];
                value._items.forEach((valueItem) => {
                    const seller = valueItem._seller;
                    const price = valueItem._price;
                    const discount = valueItem._discount;
                    items.push(new Item(seller, price, discount));
                });
                receiptStorage.addReceipt(new Receipt(items, time));

                // add radio button
                addRadioButton(time);
            });

            // update
        }

        // add event listeners
        document.getElementById('button-add-item').addEventListener('click', addItemButtonHandler, false);

        const editButtons = document.getElementsByClassName('receipt-edit-button');
        Array.from(editButtons).forEach((button) => {
            button.addEventListener('click', editButtonHandler, false);
        });
        const doneButtons = document.getElementsByClassName('receipt-done-button');
        Array.from(doneButtons).forEach((button) => {
            button.addEventListener('click', doneButtonHandler, false);
        });
        const deleteButtons = document.getElementsByClassName('receipt-delete-button');
        Array.from(deleteButtons).forEach((button) => {
            button.addEventListener('click', deleteButtonHandler, false);
        });
        const focusReset = document.getElementById('focus-reset');
        focusReset.addEventListener('focus', focusResetHandler, false);

        const buttonAddToHistory = document.getElementById('button-add-to-history');
        buttonAddToHistory.addEventListener('click', addToHistoryHandler, false);

        const closeButton = document.getElementById('close-button');
        closeButton.addEventListener('click', closeButtonHandler, false);

        const returnButton = document.getElementById('return-button');
        returnButton.addEventListener('click', returnReceipt, false);

        const isDiscountedCheckbox = document.getElementById('is-discounted');
        isDiscountedCheckbox.addEventListener('change', isDiscountedCheckboxHandler, false);

        const sellerField = document.getElementById('seller');
        sellerField.addEventListener('input', removeSellerInvalidMarker, false);

        const priceField = document.getElementById('price');
        priceField.addEventListener('input', removePriceInvalidMarker, false);

        const discountField = document.getElementById('discount');
        discountField.addEventListener('input', removeDiscountInvalidMarker, false);

        // Reset focus
        focusResetHandler();

        // Add keyboard shortcuts
        document.addEventListener('keyup', (e) => {
            // shortcut numpad-'+'
            if (e.which === 107) {
                addToHistoryHandler();
            }
        }, true);
    };

    return {
        init,
    };
}());


module.exports = userInterface;
