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
describe('Token Contract', () => {

  let owner;
  let contractSource

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
    contractSource = utils.readFileRelative('./contracts/Token.aes', "utf-8"); // Read the aes file
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
    const deployedContract=await assert.isFulfilled(deployPromise, 'Could not deploy the Token Smart Contract'); // Check it is deployed
    console.log('Contract deployed at: ' + deployedContract.address);
    console.log('Token Address:'+ testutils.getHexAddress(deployedContract.address));
  });
  describe('Interacting with Contract', async () => {
    let deployedContract;
    let compiledContract;
    
    beforeEach(async () => {
        compiledContract = await owner.contractCompile(contractSource, {})
        deployedContract = await compiledContract.deploy({
            options: {
                ttl: config.ttl
            },
            initState: `("TrustToken","TT",18,10000)`,
            abi: "sophia"
        });
    });
    it('Check properties', async() => {
        assert.equal(await testutils.callStatic(deployedContract,'name',`()`,'string'),"TrustToken");
        assert.equal(await testutils.callStatic(deployedContract,'symbol',`()`,'string'),"TT");
        assert.equal(await testutils.callStatic(deployedContract,'decimals',`()`,'int'),18);
        assert.equal(await testutils.callStatic(deployedContract,'total_supply',`()`,'int'),10000);
    });
    it('Transfer Tokens', async() => {
        const Amount=5000;
        const paramHexAddr = testutils.getHexAddress(wallets[1].publicKey);
        const transferPromise=testutils.callFunction(deployedContract,'transfer',`(${paramHexAddr},${Amount})`,'int');
        assert.isFulfilled(transferPromise,'Failed to fullfill transfer');
        const taskTransferResult = await transferPromise;
        //Assert
        assert.equal(taskTransferResult, 1);

        // New Balance Dest
        const balancePromise1 = testutils.callFunction(deployedContract,'balance_of',`(${paramHexAddr})`,'int');
        assert.isFulfilled(balancePromise1, 'Could not call balance_of');
        const taskBalanceResult1 = await balancePromise1;
        //Assert
        assert.equal(taskBalanceResult1, Amount, "Token transfer didn't work. Target account doesnt have "+Amount);

        // New Balance Src
        let ownerHexParam = testutils.getHexAddress(ownerKeyPair.publicKey);
        const balancePromise2 = testutils.callFunction(deployedContract,'balance_of',`(${ownerHexParam})`,'int');
        assert.isFulfilled(balancePromise2, 'Could not call balance_of');
        const taskBalanceResult2 = await balancePromise2;
        //Assert
        assert.equal(taskBalanceResult2, Amount, "Token transfer didn't work. Target account doesnt have "+Amount);

      });
  });
  
})