const BigNumber = require('bignumber.js');

const sqrtPriceX96 = new BigNumber('1461446703485210103287273052203988822378723970341');

const decimal0 = 18;
const decimal1 = 18;

const sqrtPrice = sqrtPriceX96.dividedBy(2 ** 96);
const sqrtPriceX2 = sqrtPrice.pow(2);

console.log(sqrtPriceX2.dividedBy(10 ** (decimal1 - decimal0)).toString(10));
