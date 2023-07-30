require('colors')
const { ethers } = require('ethers')
const player = require('play-sound')(opts = {})

// Free ethereum node
const rpcURL = 'https://cloudflare-eth.com/'
const provider = new ethers.providers.JsonRpcProvider(rpcURL)
const CONVERSION_RATE = 1000000000000000000;
const TARGET_VALUE = 50;

const playSound = () => {
  player.play('ding.mp3', function(err){
    if (err) throw err
  })
}

// Retrieve current block number
const getBlockNumber = async () => {
  console.log(` Getting current block number`);
  try{  
    return await provider.getBlockNumber();
  }catch(err){
    console.log(`Error getting block number`);
  }
}

// Retrieve current block WITH TRANSACTIONS for processing
const getBlockWithTransactions = async (blockNumber) => {
  console.log(` Getting block with transactions`);
  try{
    return await provider.getBlockWithTransactions(blockNumber); 
  }catch(err){
    console.log(`Error getting block transactions`);
  }
}

// Iterate block transactions, itentify value > 1 Eth & alert w/ sound
const processTransactions = (block) => {
  console.log(` Processing block transactions`);
  const transactions = block.transactions;
  try{
    for(let i = 0; i < transactions.length; i++) {
      let transaction = transactions[i];
      let ethValue = transaction.value/CONVERSION_RATE;
        if(ethValue >= TARGET_VALUE) {
          playSound();
          console.log(` Whale Alert!
            Iteration: ${i}
            Transaction number: ${transaction.transactionIndex}
            Value (Eth): ${ethValue}
            Whale Address: ${block.transactions[i].from}
          `.yellow);
        }  
      }
    console.log(`End of Block Transaction list. Awaiting new Block for processiing...\n`);
    }catch(err){
      console.log(`Error processessing transactions`);
    }
}

const main = async () => {
  console.log(`Whale tracker started! Listening for large transfers on Ethereum...\n`.blue);
  // On new block, process transactions on the blockchain
  provider.on("block", async () => {
    console.log(`New Block Detected.`);
    await getBlockNumber()
    .then( (blockNumber) => {return getBlockWithTransactions(blockNumber)} )
    .then( (block) => { return processTransactions(block)} )
    .catch( (error) => {
      console.log(`Error ${error.message}`)});
  });
}

main()
