const { Transaction} = require('./transaction');
const crypto = require('crypto');

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

    /*
    Starts the mining process on the block. It changes the 'nonce' until the hash
    of the block starts with enough zeros (= difficulty)

    Pokreće mining proces na bloku. Mijenja 'nonce' parametar dok hash ne bude počinjao
    sa određenih brojem nula (= difficulty)
    */
    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    /*
    Validates all the transactions inside this block (signature + hash) and
    returns true if everything checks out. False if the block is invalid.
    
    Validira sve transakcije unutar bloka (potpis + hash) i vraća true ako je
    sve potvrđeno, a false ako blok nije moguće validirati.
   */
    hasValidTransactions(){
        for(const tx of this.transactions) {
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

module.exports.Block = Block;