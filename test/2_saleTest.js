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

const ownerKeyPair = wallets[0];

describe('Crowdsale Contract', () => {

  let owner;
  let contractSource
  let beneficiaryAccount;
  let tokenContract;

  async function deployContract(filename,_initState) {
    contractSource = utils.readFileRelative(filename, "utf-8"); 
      const compiledContract = await owner.contractCompile(contractSource, { // Compile it
        gas: config.gas
      })
      const deployPromise = compiledContract.deploy({ // Deploy it
        options: {
          ttl: config.ttl,
        },
        initState: _initState,
        abi: "sophia"
      });
      const deployedContract=deployPromise;
      return  deployedContract.address;
  }

  before(async () => {
    
    owner = await Ae({
      url: config.host,
      internalUrl: config.internalHost,
      keypair: ownerKeyPair,
      nativeMode: true,
      networkId: config.networkId
    });

    beneficiaryAccount=testutils.getHexAddress( wallets[1].publicKey);
    tokenContract= testutils.getHexAddress( await deployContract('./contracts/Token.aes',`"TestToken","TE",4,100`));
    testutils.log('Test Token: ' + tokenContract);
  })
  
  it('Deploying Crowdsale Contract', async () => {
    contractSource = utils.readFileRelative('./contracts/Crowdsale.aes', "utf-8"); // Read the aes file
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
      initState: `(${beneficiaryAccount},${tokenContract})`,
      abi: "sophia"
    });
    testutils.log('Deploying Contract Bytecode');
    const deployedContract=await assert.isFulfilled(deployPromise, 'Could not deploy the Crowdsale Smart Contract'); // Check it is deployed
    testutils.log('Contract deployed at: ' + deployedContract.address);
    testutils.log('Crowdsale Address:'+ testutils.getHexAddress(deployedContract.address));
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
            initState: `(${beneficiaryAccount},${tokenContract})`,
            abi: "sophia"
        });
    });
    it('Check properties', async() => {
        assert.equal(await testutils.callStatic(deployedContract,'wallet',`()`,'address'),`${beneficiaryAccount}`);
        assert.equal(await testutils.callStatic(deployedContract,'token',`()`,'address'),`${tokenContract}`);
    });
  });
});