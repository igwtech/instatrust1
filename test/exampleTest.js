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
const bs58 = require('bs58');

const config = {
  host: "http://localhost:3001/",
  internalHost: "http://localhost:3001/internal/",
  gas: 15790000,
  ttl: 55,
  networkId: 'ae_devnet'
}
/*
const config = {
  host: "https://sdk-testnet.aepps.com",
  internalHost: "https://sdk-testnet.aepps.com",
  gas: 1000000,
  ttl: 100,
  networkId: 'ae_uat'
}
*/
console.log(wallets);
const ownerKeyPair = wallets[0];
describe('Instatrust Contract', () => {

  let owner;
  let tokenContract;
  let saleContract;
  let getHexAddress= (strAddr) => {
    return '0x' + bs58.decode(strAddr.substr(3)).toString('hex');
  }


  //Create a asynchronous read call for our smart contract
  async function contractCall(contractAddress,func, args, value, types) {
    const calledSet = await owner.contractCall(contractAddress,
    'sophia-address',contractAddress, func,
    {args, options: {amount:value}}).catch(async e => {
      const decodedError = await owner.contractDecodeData(types,
      e.returnValue).catch(e => console.error(e));
    });

    return calledSet;
  }

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
    console.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    console.log('Preparing Deployment Contract Bytecode');
    //console.log(compiledContract);
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      },
      initState: `("TrustToken","TT",18,10000)`,
      abi: "sophia"
    });
    console.log('Deploying Contract Bytecode');
    tokenContract=await assert.isFulfilled(deployPromise, 'Could not deploy the Token Smart Contract'); // Check it is deployed
    console.log('Contract deployed at: ' + tokenContract.address);
    console.log('Token Address:'+ getHexAddress(tokenContract.address));
    
  });

  it('Deploying Crowdsale Contract', async () => {
    let contractSource = utils.readFileRelative('./contracts/Crowdsale.aes', "utf-8"); // Read the aes file
    console.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    console.log('Preparing Deployment Contract Bytecode');

    const ownerHexKey = getHexAddress(ownerKeyPair.publicKey);
    const tokenHexAddr = getHexAddress(tokenContract.address);
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      },
      initState:  `("${ownerHexKey}", "${tokenHexAddr}")`,
      abi: "sophia"
    });
    console.log('Deploying Contract Bytecode');
    saleContract = await assert.isFulfilled(deployPromise, 'Could not deploy the Crowdsale Smart Contract'); // Check it is deployed
    console.log('Contract deployed at: ' + saleContract.address);
    console.log('Deployed Sale Contract with beneficiary: ' + ownerKeyPair.publicKey);
    console.log('Sale Address:'+ getHexAddress(saleContract.address));
  });

  
  it('Load Sale Contract with Tokens', async() => {
    //console.log(tokenContract);
    const saleHexAddr = getHexAddress(saleContract.address);
    
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
    //console.log(tokenContract);
    const buyerHexAddr = getHexAddress(ownerKeyPair.publicKey);
    
    const buyPromise=saleContract.call('buyTokens', {
        args:`(25)`,
        options: {
          ttl: config.ttl
        },
        amount: 25,
        deposit: 50
      });
    assert.isFulfilled(buyPromise, 'Could not call buyTokens');
    const taskResult = await buyPromise;
    //Assert
    const taskResultDecoded = await taskResult.decode("string");
    assert.equal(taskResultDecoded.value, 1);
    
    

  });

  it('Deploying Escrow Contract', async () => {
    let contractSource = utils.readFileRelative('./contracts/Escrow.aes', "utf-8"); // Read the aes file
    console.log('Compiling Contract Source');
    const compiledContract = await owner.contractCompile(contractSource, { // Compile it
      gas: config.gas
    })
    console.log('Preparing Deployment Contract Bytecode');
    const deployPromise = compiledContract.deploy({ // Deploy it
      options: {
        ttl: config.ttl,
      }
    });
    console.log('Deploying Contract Bytecode');
    await assert.isFulfilled(deployPromise, 'Could not deploy the Escrow Smart Contract'); // Check it is deployed
    
    
  })

  

})