'use strict';

// all of the possible coins
const {
  PENNY, 
  NICKEL, 
  DIME, 
  QUARTER, 
  HALF_DOLLAR, 
  SACAGAWEA_DOLLAR
} = require('./coins.js');

// even if you squint...this isn't valid US currency
const CHUCK_E_CHEESE_TOKEN = {
  name: "Chuck-E-Cheese token",
  weight: DIME.weight, 
  size: QUARTER.size, 
  value: .00
};
 
// object under test
const VendingMachine = require('./vendingMachine');

// this will be our vending machine instance to interact with
let vendingMachine;
 
describe('vending machine', () => {  
  beforeEach(() => {
    vendingMachine = new VendingMachine();
  });
  
  it('shows "INSERT COIN" when no coins added', () => {
    expect(vendingMachine.display).toEqual("INSERT COIN");
  });
  
  it('rejects pennies', () => {
    vendingMachine.add(PENNY);
    expect(vendingMachine.display).toEqual("INSERT COIN");    
  });
  
  it('rejects Chuck-E-Cheese tokens', () => {
    vendingMachine.add(CHUCK_E_CHEESE_TOKEN);
    expect(vendingMachine.display).toEqual("INSERT COIN");    
  });
  
  it('adds a nickel', () => {  
    vendingMachine.add(NICKEL);
    expect(vendingMachine.display).toEqual("$0.05"); 
  });
  
  it('adds a dime', () => {
    vendingMachine.add(DIME);
    expect(vendingMachine.display).toEqual("$0.10"); 
  });
  
  it('adds a quarter', () => {
    vendingMachine.add(QUARTER);
    expect(vendingMachine.display).toEqual("$0.25");   
  });
  
  it('adds a mix of coins', () => {
    vendingMachine.add(PENNY);
    vendingMachine.add(NICKEL);
    vendingMachine.add(DIME);
    vendingMachine.add(QUARTER);
    expect(vendingMachine.display).toEqual("$0.40");  
  });
  
  it('rolls over a dollar quite nicely', () => {    
    for (let i = 0; i <= 10; i++){
      vendingMachine.add(DIME);      
    }
    
    expect(vendingMachine.display).toEqual("$1.10");  
  });
  
});