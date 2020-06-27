const { Block } = require('./block');
const { Transaction } = require('./transaction');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
      }

    createGenesisBlock() {
        return new Block(Date.parse('2017-01-01'), [], '0');
    }

    /*
    Returns the latest block on our chain. Useful when you want to create a
    new Block and you need the hash of the previous Block.

    Vraća poslijednji blok u lancu. Korisno je kada se pravi novi blok i
    trebate dodati hash poslijednjeg bloka.
    */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /*
    Takes all the pending transactions, puts them in a Block and starts the
    mining process. It also adds a transaction to send the mining reward to
    the given address.

    Uzima sve transakcije na čekanju i stavlja ih u blok i počinje mining proces.
    Također dodaje transakciju za slanje nagrade datoj adresi
    NOTE: U real world scenariju nije moguće dodati sve transakcije
    odjednom jer ih ima previše
    */
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
    
        this.pendingTransactions = [];
    }

    /*
    Add a new transaction to the list of pending transactions (to be added
    next time the mining process starts).
    
    Dodaje novu transakciju na listu transakcija na čekanju (koje će biti dodane
    slijedeći put kada počne mining proces).
    */

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
          throw new Error('Transaction must include from and to address');
        }
    
        // Verify the transactiion
        // Validira/potvrđuje transakciju
        if (!transaction.isValid()) {
          throw new Error('Cannot add invalid transaction to chain');
        }
        
        if (transaction.amount <= 0) {
          throw new Error('Transaction amount should be higher than 0');
        }
        
        // Making sure that the amount sent is not greater than existing balance
        // Potvrđujemo da količina koja je poslana nije veća od trenutnog stanja računa
        if (this.getBalanceOfAddress(transaction.fromAddress) > transaction.amount) {
          throw new Error('Not enough balance');
        }
    
        this.pendingTransactions.push(transaction);
    }

    // Returns the balance of a given wallet address.
    // Vraća stanje računa date adrese
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
              if (transaction.fromAddress === address) {
                balance -= transaction.amount;
              }
      
              if (transaction.toAddress === address) {
                balance += transaction.amount;
              }
            }
          }

        return balance;
    }

    /*
    Returns a list of all transactions that happened
    to and from the given wallet address.

    Vraća listu svih transakcija koju su se desile
    od i do date adrese.
   */
    getAllTransactionsForWallet(address) {
        const txs = [];
    
        for (const block of this.chain) {
          for (const tx of block.transactions) {
            if (tx.fromAddress === address || tx.toAddress === address) {
              txs.push(tx);
            }
          }
        }
    
        return txs;
    }

    /*
    Loops over all the blocks in the chain and verify if they are properly
    linked together and nobody has tampered with the hashes.

    Prolazi kroz sve blokove u lancu i potvrđuje da su ispravno povezani i da
    niko nije "popravljao" hashove
    */
    isChainValid() {
        const realGenesis = JSON.stringify(this.createGenesisBlock());
    
        if (realGenesis !== JSON.stringify(this.chain[0])) {
            return false;
        }

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
    
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        }
        return true;
      }
}

module.exports.Blockchain = Blockchain;
