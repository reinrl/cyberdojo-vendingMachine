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

const pileOChange = [
  { id: "nickel", count: 10 },
  { id: "dime", count: 10 },
  { id: "quarter", count: 10 },
  { id: "half_dollar", count: 10 },
  { id: "sacagawea_dollar", count: 10 },
];

const minimalPileOChange = [
  { id: "nickel", count: 5 },
  { id: "dime", count: 5 },
  { id: "quarter", count: 4 },
  { id: "half_dollar", count: 5 },
  { id: "sacagawea_dollar", count: 5 },
];

// object under test
const VendingMachine = require("./vendingMachine");

// this will be our vending machine instance to interact with
let vendingMachine;

describe("vending machine", () => {
  describe("insertCoin", () => {
    beforeEach(() => {
      vendingMachine = new VendingMachine(inventory, pileOChange);
    });

    it('shows "INSERT COIN" when no coins added', () => {
      expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
    });

    it("rejects pennies", () => {
      const returnState = vendingMachine.insertCoin(PENNY);

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "INSERT COIN",
          coinReturn: [PENNY],
          productReturn: null,
        })
      );
    });

    it("rejects Chuck-E-Cheese tokens", () => {
      const returnState = vendingMachine.insertCoin(CHUCK_E_CHEESE_TOKEN);

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "INSERT COIN",
          coinReturn: [CHUCK_E_CHEESE_TOKEN],
          productReturn: null,
        })
      );
    });

    it("adds a nickel", () => {
      const returnState = vendingMachine.insertCoin(NICKEL);

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.05",
          coinReturn: null,
          productReturn: null,
        })
      );
    });

    it("adds a dime", () => {
      const returnState = vendingMachine.insertCoin(DIME);

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.10",
          coinReturn: null,
          productReturn: null,
        })
      );
    });

    it("adds a quarter", () => {
      const returnState = vendingMachine.insertCoin(QUARTER);

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.25",
          coinReturn: null,
          productReturn: null,
        })
      );
    });

    // QUESTION!!!! IF THEY ADD SEVEN PENNYS DOES THE RETURN LIST GROW? OR DO WE ASSUME THE USER GRABS EACH IMMEDIATELY IN THE RETURN???????
    it("adds a mix of coins", () => {
      let returnState = vendingMachine.insertCoin(PENNY);
      expect(returnState).toEqual(
        expect.objectContaining({
          display: "INSERT COIN",
          coinReturn: [PENNY],
          productReturn: null,
        })
      );

      returnState = vendingMachine.insertCoin(NICKEL);
      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.05",
          coinReturn: null,
          productReturn: null,
        })
      );

      returnState = vendingMachine.insertCoin(DIME);
      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.15",
          coinReturn: null,
          productReturn: null,
        })
      );

      returnState = vendingMachine.insertCoin(QUARTER);
      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$0.40",
          coinReturn: null,
          productReturn: null,
        })
      );
    });

    it("rolls over a dollar quite nicely", () => {
      let returnState = {};
      for (let i = 0; i <= 10; i++) {
        returnState = vendingMachine.insertCoin(DIME);
      }

      expect(returnState).toEqual(
        expect.objectContaining({
          display: "$1.10",
          coinReturn: null,
          productReturn: null,
        })
      );
    });
  });

  describe("selectProduct", () => {
    describe("check price (no money yet)", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory, pileOChange);
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
        vendingMachine = new VendingMachine(inventory, pileOChange);
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
        vendingMachine = new VendingMachine(inventory, pileOChange);
      });

      it("purchase candy", () => {
        // insert exact change
        for (let i = 0; i < 13; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("candy");

        // verify the expected outcome
        expect(returnState).toEqual(
          expect.objectContaining({
            display: "THANK YOU",
            coinReturn: null,
            productReturn: "candy",
          })
        );

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("purchase chips", () => {
        // insert exact change
        vendingMachine.insertCoin(HALF_DOLLAR);

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("chips");

        // verify the expected outcome
        expect(returnState).toEqual(
          expect.objectContaining({
            display: "THANK YOU",
            coinReturn: null,
            productReturn: "chips",
          })
        );

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });

      it("purchase cola", () => {
        // insert exact change
        vendingMachine.insertCoin(SACAGAWEA_DOLLAR);

        // attempt to purchase our product
        const returnState = vendingMachine.selectProduct("cola");

        // verify the expected outcome
        expect(returnState).toEqual(
          expect.objectContaining({
            display: "THANK YOU",
            coinReturn: null,
            productReturn: "cola",
          })
        );

        // check the display again for good measure
        expect(vendingMachine.checkDisplay()).toEqual("INSERT COIN");
      });
    });

    describe("too much change entered", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(inventory, pileOChange);
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
        vendingMachine = new VendingMachine(inventory, pileOChange);
      });

      it("should return all of the things", () => {
        // insert cash money
        const expectedCoinReturn = [];
        for (let i = 0; i < 25; i++) {
          vendingMachine.insertCoin(NICKEL);
          expectedCoinReturn.push(NICKEL);
        }

        const returnState = vendingMachine.returnCoins();

        expect(returnState).toEqual(
          expect.objectContaining({
            display: "INSERT COIN",
            coinReturn: expectedCoinReturn,
          })
        );
      });
    });

    describe("check stock", () => {
      beforeEach(() => {
        vendingMachine = new VendingMachine(candyLessInventory, pileOChange);
      });

      it("out of stock with money", () => {
        // insert cash money
        for (let i = 0; i < 25; i++) {
          vendingMachine.insertCoin(NICKEL);
        }

        // CANDY = .65
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState).toEqual(
          expect.objectContaining({
            display: "SOLD OUT",
            coinReturn: null,
            productReturn: null,
          })
        );
        expect(vendingMachine.checkDisplay()).toEqual("$1.25");
      });

      it("out of stock with money, so I order a substitute", () => {
        // insert cash money
        for (let i = 0; i < 5; i++) {
          vendingMachine.insertCoin(QUARTER);
        }

        // CANDY = .65
        let returnState = vendingMachine.selectProduct("candy");

        expect(returnState).toEqual(
          expect.objectContaining({
            display: "SOLD OUT",
            coinReturn: null,
            productReturn: null,
          })
        );
        expect(vendingMachine.checkDisplay()).toEqual("$1.25");

        // no candy, so I'll have chips instead
        returnState = vendingMachine.selectProduct("chips");

        // success!
        expect(returnState.display).toEqual("THANK YOU");
        expect(returnState.productReturn).toEqual("chips");
        // .75 back
        expect(returnState.coinReturn.length).toEqual(3);
        expect(
          returnState.coinReturn.filter((coin) => coin === QUARTER).length
        ).toEqual(3);
      });

      it("out of stock no money", () => {
        // CANDY = .65
        const returnState = vendingMachine.selectProduct("candy");

        expect(returnState).toEqual(
          expect.objectContaining({
            display: "SOLD OUT",
            coinReturn: null,
            productReturn: null,
          })
        );
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
        expect(returnState).toEqual(
          expect.objectContaining({
            display: "SOLD OUT",
            coinReturn: null,
            productReturn: null,
          })
        );
        expect(vendingMachine.checkDisplay()).toEqual("$1.00");
      });
    });

    describe("exact change only", () => {
      let vendingMachine;

      it('shows "EXACT CHANGE ONLY" when no change available', () => {
        vendingMachine = new VendingMachine(inventory);

        expect(vendingMachine.checkDisplay()).toEqual("EXACT CHANGE ONLY");
      });

      it('shows "EXACT CHANGE ONLY" when too few change available', () => {
        vendingMachine = new VendingMachine(inventory, minimalPileOChange);

        expect(vendingMachine.checkDisplay()).toEqual("EXACT CHANGE ONLY");
      });

      it("cares not for your play money", () => {
        vendingMachine = new VendingMachine(inventory, [
          ...minimalPileOChange,
          {
            id: "penny",
            count: 5000,
          },
        ]);

        expect(vendingMachine.checkDisplay()).toEqual("EXACT CHANGE ONLY");
      });
    });
  });
});
