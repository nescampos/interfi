const express = require('express')
const { connect, LedgerEnv, SettlementEngineType } = require('@nescampos/ilp-sdk');
const BigNumber = require('bignumber.js')

var parseUrl = require('body-parser')
const app = express()

async function runXRPtoETH(amountToSend, xrplSeed, ethKey) {
    const sdk = await connect(LedgerEnv.Testnet);
    const xrpUplink = await sdk.add({
            settlerType: SettlementEngineType.XrpPaychan,
            secret: xrplSeed
        });
    const ethUplink = await sdk.add({
        settlerType: SettlementEngineType.Machinomy,
        privateKey: ethKey
    });
    console.log('Connected');

    await sdk.deposit({
        /** Uplink to deposit to */
        uplink: xrpUplink,
    
        /**
         * Amount to deposit, in the unit of exchange
         * (e.g. in this case, ether; not gwei or wei)
         */
        amount: new BigNumber(amountToSend+0.01),
    
        /**
         * Callback to authorize the fee and amount to be transferred from layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee }) => {
        console.log('Fee:', fee.amount.toString())
    
        // Resolve the Promise continue with the deposit...
        return
    
        // ...or reject the Promise to cancel it:
        throw new Error('Fee too high!')
        }
    });

    console.log('Deposited');

    try {
        await sdk.streamMoney({
            /** Amount to send in units of exchange of the source uplink */
            amount: new BigNumber(amountToSend),
        
            /** Sending uplink */
            source: xrpUplink,
        
            /** Receiving uplink */
            dest: ethUplink,
        
            /** Optionally, specify a maximum slippage margin against the most recently fetched exchange rate */
            slippage: 0.02
        });
    }catch(err) {
        console.error(err);
    }

    

    console.log('Streamed');

    await sdk.withdraw({
        /** Uplink to withdraw from */
        uplink: xrpUplink,
      
        /**
         * Callback to authorize the fee and amount to be transferred to layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee, value }) => {
          console.log('Fee:', fee.amount.toString())
      
          // Resolve the Promise continue with the withdrawal...
          return
      
          // ...or reject the Promise to cancel it:
          throw new Error('Fee too high!')
        }
      })
      await sdk.withdraw({
        /** Uplink to withdraw from */
        uplink: ethUplink,
      
        /**
         * Callback to authorize the fee and amount to be transferred to layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee, value }) => {
          console.log('Fee:', fee.amount.toString())
      
          // Resolve the Promise continue with the withdrawal...
          return
      
          // ...or reject the Promise to cancel it:
          throw new Error('Fee too high!')
        }
      })

      console.log('Withdrawal');
      
    await sdk.remove(xrpUplink);
    await sdk.remove(ethUplink);

    await sdk.disconnect();

    console.log('Disconnected');
}

async function runETHtoXRP(amountToSend, xrplSeed, ethKey) {
    const sdk = await connect(LedgerEnv.Testnet);
    const xrpUplink = await sdk.add({
            settlerType: SettlementEngineType.XrpPaychan,
            secret: xrplSeed
        });
    const ethUplink = await sdk.add({
        settlerType: SettlementEngineType.Machinomy,
        privateKey: ethKey
    });
    console.log('Connected');

    await sdk.deposit({
        /** Uplink to deposit to */
        uplink: ethUplink,
    
        /**
         * Amount to deposit, in the unit of exchange
         * (e.g. in this case, ether; not gwei or wei)
         */
        amount: new BigNumber(amountToSend+0.001),
    
        /**
         * Callback to authorize the fee and amount to be transferred from layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee }) => {
        console.log('Fee:', fee.amount.toString())
    
        // Resolve the Promise continue with the deposit...
        return
    
        // ...or reject the Promise to cancel it:
        throw new Error('Fee too high!')
        }
    });

    console.log('Deposited');

    try {
        await sdk.streamMoney({
            /** Amount to send in units of exchange of the source uplink */
            amount: new BigNumber(amountToSend),
        
            /** Sending uplink */
            source: ethUplink,
        
            /** Receiving uplink */
            dest: xrpUplink,
        
            /** Optionally, specify a maximum slippage margin against the most recently fetched exchange rate */
            slippage: 0.02
        });
    }catch(err) {
        console.error(err);
    }

    

    console.log('Streamed');

    await sdk.withdraw({
        /** Uplink to withdraw from */
        uplink: ethUplink,
      
        /**
         * Callback to authorize the fee and amount to be transferred to layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee, value }) => {
          console.log('Fee:', fee.amount.toString())
      
          // Resolve the Promise continue with the withdrawal...
          return
      
          // ...or reject the Promise to cancel it:
          throw new Error('Fee too high!')
        }
      })
      await sdk.withdraw({
        /** Uplink to withdraw from */
        uplink: xrpUplink,
      
        /**
         * Callback to authorize the fee and amount to be transferred to layer 1, after it's calculated,
         * which must return a Promise
         */
        authorize: async ({ fee, value }) => {
          console.log('Fee:', fee.amount.toString())
      
          // Resolve the Promise continue with the withdrawal...
          return
      
          // ...or reject the Promise to cancel it:
          throw new Error('Fee too high!')
        }
      })

      console.log('Withdrawal');
      
    await sdk.remove(xrpUplink);
    await sdk.remove(ethUplink);

    await sdk.disconnect();

    console.log('Disconnected');
}


let encodeUrl = parseUrl.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })

app.get('/xrptoeth', (req, res) => {
  res.sendFile(__dirname + '/xrptoeth.html')
})

app.get('/xrptoethsuccess', (req, res) => {
    res.sendFile(__dirname + '/xrptoeth_success.html')
  })

app.post('/xrptoeth', encodeUrl, async (req, res) => {
  await runXRPtoETH(req.body.amount,req.body.xrplseed, req.body.ethprivatekey)
  res.redirect('/xrptoethsuccess');
})

app.get('/ethtoxrp', (req, res) => {
    res.sendFile(__dirname + '/ethtoxrp.html')
  })

  app.get('/ethtoxrpsuccess', (req, res) => {
    res.sendFile(__dirname + '/ethtoxrp_success.html')
  })
  
  app.post('/ethtoxrp', encodeUrl, async (req, res) => {
    await runETHtoXRP(req.body.amount,req.body.xrplseed, req.body.ethprivatekey)
    res.redirect('/ethtoxrpsuccess');
  })

  app.use(express.static('public'));

app.listen(4000)