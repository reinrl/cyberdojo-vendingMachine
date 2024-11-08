"use strict";

// all of the possible coins
const {
  PENNY,
  NICKEL,
  DIME,
  QUARTER,
  HALF_DOLLAR,
  SACAGAWEA_DOLLAR,
} = require("./coins.js");

// even if you squint...this isn't valid US currency
const CHUCK_E_CHEESE_TOKEN = {
  name: "Chuck-E-Cheese token",
  weight: DIME.weight,
  size: QUARTER.size,
  value: 0.0,
};

// things we can use to stock the machine
const { inventory } = require("./inventory.js");
const candyLessInventory = inventory.map((product) => {
  if (product.displayName === "candy") {
    return { ...product, stock: 0 };
  } else {
    return product;
  }
});

// object under test
const VendingMachine = require("./vendingMachine");

// this will be our vending machine instance to interact with
let vendingMachine;

describe("vending machine", () => {
  describe("add", () => {
    beforeEach(() => {
      vendingMachine = new VendingMachine(inventory);
    });

    it('shows "INSERT COIN" when no coins added', () => {
      expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
    });

    it("rejects pennies", () => {
      const returnState = vendingMachine.insertCoin(PENNY);
      expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      expect(returnState.display).toEqual("INSERT COIN");
      expect(returnState.coinReturn).toEqual([PENNY]);
      expect(returnState.productReturn).toEqual(null);
    });

    it("rejects Chuck-E-Cheese tokens", () => {
      const returnState = vendingMachine.insertCoin(CHUCK_E_CHEESE_TOKEN);
      expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      expect(returnState.display).toEqual("INSERT COIN");
      expect(returnState.coinReturn).toEqual([CHUCK_E_CHEESE_TOKEN]);
      expect(returnState.productReturn).toEqual(null);
    });

    it("adds a nickel", () => {
      const returnState = vendingMachine.insertCoin(NICKEL);
      expect(vendingMachine.checkDisplay()).toEqual("$0.05");
      expect(returnState.display).toEqual("$0.05");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);
    });

    it("adds a dime", () => {
      const returnState = vendingMachine.insertCoin(DIME);
      expect(vendingMachine.checkDisplay()).toEqual("$0.10");
      expect(returnState.display).toEqual("$0.10");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);
    });

    it("adds a quarter", () => {
      const returnState = vendingMachine.insertCoin(QUARTER);
      expect(vendingMachine.checkDisplay()).toEqual("$0.25");
      expect(returnState.display).toEqual("$0.25");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);
    });

    // QUESTION!!!! IF THEY ADD SEVEN PENNYS DOES THE RETURN LIST GROW? OR DO WE ASSUME THE USER GRABS EACH IMMEDIATELY IN THE RETURN???????
    it("adds a mix of coins", () => {
      let returnState = vendingMachine.insertCoin(PENNY);
      expect(returnState.display).toEqual("INSERT COIN");
      expect(returnState.coinReturn).toEqual([PENNY]);
      expect(returnState.productReturn).toEqual(null);

      returnState = vendingMachine.insertCoin(NICKEL);
      expect(returnState.display).toEqual("$0.05");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);

      returnState = vendingMachine.insertCoin(DIME);
      expect(returnState.display).toEqual("$0.15");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);

      returnState = vendingMachine.insertCoin(QUARTER);
      expect(returnState.display).toEqual("$0.40");
      expect(returnState.coinReturn).toEqual(null);
      expect(returnState.productReturn).toEqual(null);

      expect(vendingMachine.checkDisplay()).toEqual("$0.40");
    });

    it("rolls over a dollar quite nicely", () => {
      for (let i = 0; i <= 10; i++) {
        vendingMachine.insertCoin(DIME);
      }

      expect(vendingMachine.checkDisplay()).toEqual("$1.10");
    });
  });

  describe("purchase", () => {
    describe("check price (no money yet)", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory);
      });

      it("check the price of candy", () => {
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState.display).toEqual("PRICE $0.65");
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("check the price of chips", () => {
        const returnState = vendingMachine.selectProduct("chips");

        expect(returnState.display).toEqual("PRICE $0.50");
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("check the price of cola", () => {
        const returnState = vendingMachine.selectProduct("cola");

        expect(returnState.display).toEqual("PRICE $1.00");
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });
    });

    describe("not enough change entered", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory);
        vendingMachine.insertCoin(QUARTER);
      });

      it("check the price of candy", () => {
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState.display).toEqual("PRICE $0.65");
        expect(vendingMachine.checkDisplay()).toEqual("$0.25");
      });

      it("check the price of chips", () => {
        const returnState = vendingMachine.selectProduct("chips");

        expect(returnState.display).toEqual("PRICE $0.50");
        expect(vendingMachine.checkDisplay()).toEqual("$0.25");
      });

      it("check the price of cola", () => {
        const returnState = vendingMachine.selectProduct("cola");

        expect(returnState.display).toEqual("PRICE $1.00");
        expect(vendingMachine.checkDisplay()).toEqual("$0.25");
      });
    });

    describe("exact change entered", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory);
      });

      it("purchase candy", () => {
        // insert exact change
        for (let i = 0; i < 13; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("candy");

        // verify the expected outcome
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.coinReturn).toEqual(null);
        expect(returnState.productReturn).toEqual("candy");

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("purchase chips", () => {
        // insert exact change
        vendingMachine.insertCoin(HALF_DOLLAR);

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("chips");

        // verify the expected outcome
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.coinReturn).toEqual(null);
        expect(returnState.productReturn).toEqual("chips");

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("purchase cola", () => {
        // insert exact change
        vendingMachine.insertCoin(SACAGAWEA_DOLLAR);

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("cola");

        // verify the expected outcome
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.coinReturn).toEqual(null);
        expect(returnState.productReturn).toEqual("cola");

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });
    });

    describe("too much change entered", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory);
      });

      it("purchase candy", () => {
        // insert cash money
        for (let i = 0; i < 25; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // CANDY = .65
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.productReturn).toEqual("candy");
        // .60 back
        expect(returnState.coinReturn.length).toEqual(3);
        expect(
          returnState.coinReturn.filter((coin) => coin === QUARTER).length
        ).toEqual(2);
        expect(
          returnState.coinReturn.filter((coin) => coin === DIME).length
        ).toEqual(1);
      });

      it("purchase chips", () => {
        // insert cash money
        for (let i = 0; i < 18; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // CHIPS = .50
        const returnState = vendingMachine.selectProduct("chips");

        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.productReturn).toEqual("chips");
        // .40 back
        expect(returnState.coinReturn.length).toEqual(3);
        expect(
          returnState.coinReturn.filter((coin) => coin === QUARTER).length
        ).toEqual(1);
        expect(
          returnState.coinReturn.filter((coin) => coin === DIME).length
        ).toEqual(1);
        expect(
          returnState.coinReturn.filter((coin) => coin === NICKEL).length
        ).toEqual(1);
      });

      it("purchase cola", () => {
        // insert cash money
        for (let i = 0; i < 21; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // COLA = 1.00
        const returnState = vendingMachine.selectProduct("cola");
        // LOOK AT THIS PHOTOGRAPH
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.productReturn).toEqual("cola");
        expect(returnState.coinReturn.length).toEqual(1);
        expect(
          returnState.coinReturn.filter((coin) => coin === NICKEL).length
        ).toEqual(1);
      });
    });

    describe("should I no longer be hungry...I don't want to be broke", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory);
      });

      it("should return all of the things", () => {
        // insert cash money
        const expectedCoinReturn = [];
        for (let i = 0; i < 25; i++) {
          vendingMachine.insertCoin(NICKEL);
          expectedCoinReturn.push(NICKEL);
        }

        const returnState = vendingMachine.returnCoins();

        expect(returnState.display).toEqual("INSERT COIN");
        expect(returnState.coinReturn).toEqual(expectedCoinReturn);
      });
    });

    describe("check stock", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(candyLessInventory);
      });

      it("out of stock with money", () => {
        // insert cash money
        for (let i = 0; i < 25; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // CANDY = .65
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState.display).toEqual("SOLD OUT");
        expect(returnState.productReturn).toEqual(null);
        expect(vendingMachine.checkDisplay()).toEqual("$1.25");
      });

      it("out of stock no money", () => {
        // CANDY = .65
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState.display).toEqual("SOLD OUT");
        expect(returnState.productReturn).toEqual(null);
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("bought the last one", () => {
        vendingMachine.insertCoin(SACAGAWEA_DOLLAR);

        let returnState = vendingMachine.selectProduct("cola");
        // LOOK AT THIS PHOTOGRAPH
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.productReturn).toEqual("cola");
        expect(returnState.coinReturn).toEqual(null);

        vendingMachine.insertCoin(SACAGAWEA_DOLLAR);

        // COLA = 1.00
        returnState = vendingMachine.selectProduct("cola");
        expect(returnState.display).toEqual("SOLD OUT");
        expect(returnState.productReturn).toEqual(null);
        expect(vendingMachine.checkDisplay()).toEqual("$1.00");
      });
    });
  });
});
