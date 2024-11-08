"use strict";

const {
  NICKEL,
  DIME,
  QUARTER,
  HALF_DOLLAR,
  SACAGAWEA_DOLLAR,
} = require("./coins.js");

// these are the only coins currently recognized by our machine
const VALID_COINS = [NICKEL, DIME, QUARTER, HALF_DOLLAR, SACAGAWEA_DOLLAR];

/* machine state example
const machineState = {
 display:
 productReturn:
 coinReturn:
}
*/

class VendingMachine {
  // private variables - the starting point
  #availableBalance = 0;
  #coinReturn = [];
  #inventory = [];

  constructor(inventory) {
    // time to stock our machine
    this.#inventory = [...inventory];
  }

  ///////////////////////
  // Private functions //
  ///////////////////////
  #formatForDisplay(balance) {
    const displayFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    return balance === 0
      ? "INSERT COIN"
      : displayFormatter.format(balance / 100);
  }

  #removeOneFromInventory(itemName) {
    const inventory = [...this.#inventory];
    this.#inventory = inventory.map((product) => {
      if (itemName === product.displayName) {
        return { ...product, stock: product.stock - 1 };
      } else {
        return product;
      }
    });
  }

  //////////////////////
  // Public functions //
  //////////////////////
  checkDisplay() {
    return this.#formatForDisplay(this.#availableBalance);
  }

  insertCoin(token) {
    let foundCoin = VALID_COINS.find(
      (coin) => coin.weight === token.weight && coin.size === token.size
    );

    // if valid - add to the balance
    if (foundCoin) {
      this.#availableBalance += foundCoin.value;

      this.#coinReturn.push(token);
    }

    return {
      display: this.#formatForDisplay(this.#availableBalance),
      productReturn: null,
      coinReturn: foundCoin ? null : [token],
    };
  }

  returnCoins() {
    const returnState = {
      display: "INSERT COIN",
      productReturn: null,
      coinReturn: this.#coinReturn,
    };

    // reset the vending machine state of things
    this.#availableBalance = 0;
    this.#coinReturn = [];

    return returnState;
  }

  selectProduct(itemName) {
    const selectedItem = this.#inventory.find(
      (product) => itemName === product.displayName
    );

    if (selectedItem.stock === 0) {
      return {
        display: "SOLD OUT",
        productReturn: null,
        coinReturn: null,
      };
    } else if (this.#availableBalance === selectedItem.price) {
      // dispense item
      this.#availableBalance = 0;
      this.#coinReturn = [];
      this.#removeOneFromInventory(itemName);

      // display: "THANK YOU"
      return {
        display: "THANK YOU",
        productReturn: selectedItem.displayName,
        coinReturn: null,
      };
    } else if (this.#availableBalance > selectedItem.price) {
      // dispense item
      this.#coinReturn = [];

      this.#availableBalance -= selectedItem.price;

      this.#removeOneFromInventory(itemName);

      // figure out the minimum number of coins
      const quarters = Math.floor(this.#availableBalance / QUARTER.value);
      this.#availableBalance -= quarters * QUARTER.value;

      const dimes = Math.floor(this.#availableBalance / DIME.value);
      this.#availableBalance -= dimes * DIME.value;

      const nickels = Math.floor(this.#availableBalance / NICKEL.value);
      this.#availableBalance -= nickels * NICKEL.value;

      // at this point the available balance should be zero

      // fill our return object
      const coinReturn = [];
      coinReturn.push(...Array(quarters).fill(QUARTER));
      coinReturn.push(...Array(dimes).fill(DIME));
      coinReturn.push(...Array(nickels).fill(NICKEL));

      // display: "THANK YOU"
      return {
        display: "THANK YOU",
        productReturn: selectedItem.displayName,
        coinReturn,
      };
    } else {
      // display: "PRICE [item.price]"
      return {
        display: `PRICE ${this.#formatForDisplay(selectedItem.price)}`,
        productReturn: null,
        coinReturn: null,
      };
    }
  }
}

module.exports = VendingMachine;
