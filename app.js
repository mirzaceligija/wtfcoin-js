const { Blockchain } = require('./src/blockchain');
const { Block } = require('./src/block');
const { Transaction } = require('./src/transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Your private key goes here (from keygenerator.js)
// Ovdje ide privatni ključ (iz keygenerator.js) 
const myKey = ec.keyFromPrivate('7d13764f2f3d7ec893dde9a0479e4fdc05887153863d9f71bf163bc50cd2b303');
const myWalletAddress = myKey.getPublic('hex');

// Create new instance of Blockchain class
// Kreiramo novu instancu Blockchain klase
const wtfCoin = new Blockchain();

// Create a transaction & sign it with your key
// Kreiramo transakciju i potpisujemo je svojim ključem
const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
wtfCoin.addTransaction(tx1);

// Mine block
console.log('\n Starting the miner...');
wtfCoin.minePendingTransactions(myWalletAddress);

const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
wtfCoin.addTransaction(tx2);

console.log('\n Starting the miner...');
wtfCoin.minePendingTransactions(myWalletAddress);

// Checking your balance
// Provjeravamo stanje računa
console.log('\nYour balance is', wtfCoin.getBalanceOfAddress(myWalletAddress));


// Check if the chain is valid
// Provjera da li je "lanac" validan
console.log();
console.log('Blockchain valid ?', wtfCoin.isChainValid() ? 'Yes' : 'No');
