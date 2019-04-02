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

const config = {
  host: "http://localhost:3001/",
  internalHost: "http://localhost:3001/internal/",
  gas: 200,
  ttl: 55
}
console.log(wallets);
const Deployer = require('forgae').Deployer;
const sdk = require('@aeternity/aepp-sdk');

const gasLimit = 1000000;

const deploy = async (network, privateKey) => {
	let deployer = new Deployer(network, privateKey);
	
	console.log("Deploying Token.aes");
	let tokenContract = await deployer.deploy("./contracts/Token.aes",gasLimit,`("TrustToken",  "TT",  18,  10000000000000000000)`);
	console.log("Token Contract Address:"+tokenContract.address);
	
	console.log("Deploying Crowdsale.aes");
	//console.log(wallet);
	let result2 = await deployer.deploy("./contracts/Crowdsale.aes",gasLimit, `("ak_zPoY7cSHy2wBKFsdWJGXM7LnSjVt6cn1TWBDdRBUMC7Tur2NQ","result1" )`);
	console.log(result2);

	console.log("Deploying Escrow.aes");
	let result3 = await deployer.deploy("./contracts/Escrow.aes",gasLimit,"\"\",100000000000000");
	console.log(result3);
};

module.exports = {
	deploy
};