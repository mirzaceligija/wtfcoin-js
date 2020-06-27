const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
      }

    // Creates a SHA256 hash of the transaction
    // Kreira SHA256 hash za transakciju
    calculateHash() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
    }


    /*
        Signs a transaction with the given signingKey.
        The signature is then stored inside the
        transaction object and later stored on the blockchain.

        Potpisuje/prijavljuje transakciju sa datim ključem.
        "Potpis" se sprema unutar transakcije, a poslije u sami lanac.
    */
    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    // Checks if the signature is valid
    // Provjera da li je potpis validan
    isValid() {
        // If the transaction doesn't have a from address we assume it's a mining reward (from system)
        // Ukoliko transakcije nema adresu pošiljatelja onda se smatra da je nagrada za mining (od sistema)
        if(this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports.Transaction = Transaction;