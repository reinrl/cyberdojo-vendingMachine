'use strict';

const {NICKEL, DIME, QUARTER} = require('./coins.js');

// these are the only coins currently recognized by our machine
const VALID_COINS = [
  NICKEL,
  DIME,
  QUARTER
];
 
class VendingMachine {
  constructor(){
    // what should we display on the screen?
    this.display = "INSERT COIN";
    // how much do they have to spend?
    this.availableBalance = 0;
    
    this.displayFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };
  
  add(token){
    let foundCoin = VALID_COINS.find((coin) => 
      coin.weight === token.weight && coin.size === token.size);
    
    if (foundCoin){
      this.availableBalance += foundCoin.value;
      
      this.display = this.displayFormatter.format(this.availableBalance);
    }
  };
}
 
module.exports = VendingMachine;