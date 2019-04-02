/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
const Ae = require('@aeternity/aepp-sdk').Universal;
const testutils = require('./utils.js');
const config = require('./config');

testutils.log(wallets);
const ownerKeyPair = wallets[0];
describe('Integration between Contract', () => {

  let owner;
  let tokenContract;
  let saleContract;

  before(async () => {
    
    owner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: ownerKeyPair,
      nativeMode: true,
      networkId: config.networkId
    });
    
  })
  
  it('Deploying Token Contract', async () => {
    let contractSource = utils.readFileRelative('./contracts/Token.aes', "utf-8"); // Read the aes file
    testutils.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    testutils.log('Preparing Deployment Contract Bytecode');
    //testutils.log(compiledContract);
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      },
      initState: `("TrustToken","TT",18,10000)`,
      abi: "sophia"
    });
    testutils.log('Deploying Contract Bytecode');
    tokenContract=await assert.isFulfilled(deployPromise, 'Could not deploy the Token Smart Contract'); // Check it is deployed
    testutils.log('Contract deployed at: ' + tokenContract.address);
    testutils.log('Token Address:'+ testutils.getHexAddress(tokenContract.address));
    
  });

  it('Deploying Crowdsale Contract', async () => {
    let contractSource = utils.readFileRelative('./contracts/Crowdsale.aes', "utf-8"); // Read the aes file
    testutils.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    testutils.log('Preparing Deployment Contract Bytecode');

    const ownerHexKey = testutils.getHexAddress(ownerKeyPair.publicKey);
    const tokenHexAddr = testutils.getHexAddress(tokenContract.address);
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      },
      initState:  `("${ownerHexKey}", "${tokenHexAddr}")`,
      abi: "sophia"
    });
    testutils.log('Deploying Contract Bytecode');
    saleContract = await assert.isFulfilled(deployPromise, 'Could not deploy the Crowdsale Smart Contract'); // Check it is deployed
    testutils.log('Contract deployed at: ' + saleContract.address);
    testutils.log('Deployed Sale Contract with beneficiary: ' + ownerKeyPair.publicKey);
    testutils.log('Sale Address:'+ testutils.getHexAddress(saleContract.address));
  });

  
  it('Load Sale Contract with Tokens', async() => {
    //testutils.log(tokenContract);
    const saleHexAddr = testutils.getHexAddress(saleContract.address);
    
    const transferPromise=tokenContract.call('transfer', {
        args:`(${saleHexAddr},5000)`,
        options: {
          ttl: config.ttl
        }
      });
    assert.isFulfilled(transferPromise, 'Could not call transfer');
    const taskTransferResult = await transferPromise;
    //Assert
    const taskTransferResultDecoded = await taskTransferResult.decode("int");
    assert.equal(taskTransferResultDecoded.value, 1);
    
      

  });

  it('Purchase some tokens', async() => {
    //testutils.log(tokenContract);
    const buyerHexAddr = testutils.getHexAddress(wallets[0].publicKey);
    testutils.log(`Buying Tokens for ${wallets[0].publicKey}`);
    const buyPromise=saleContract.call('buyTokensFor', {
        args:`(${buyerHexAddr},25)`,
        options: {
          ttl: config.ttl,
          amount: 25 
        }
      });
    assert.isFulfilled(buyPromise, 'Could not call buyTokensFor');
    const taskResult = await buyPromise;
    //Assert
    const taskResultDecoded = await taskResult.decode("int");
    assert.equal(taskResultDecoded.value, 25);
    
    

  });

  it('Deploying Escrow Contract', async () => {
    let contractSource = utils.readFileRelative('./contracts/Escrow.aes', "utf-8"); // Read the aes file
    testutils.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    testutils.log('Preparing Deployment Contract Bytecode');
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      }
    });
    testutils.log('Deploying Contract Bytecode');
    await assert.isFulfilled(deployPromise, 'Could not deploy the Escrow Smart Contract'); // Check it is deployed
    
    
  })

  

})