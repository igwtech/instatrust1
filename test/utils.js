const bs58 = require('bs58');
module.exports = {
    getHexAddress: (strAddr) => {
        return '0x' + bs58.decode(strAddr.substr(3)).toString('hex');
    },
    callStatic: async (contract,func,strArgs,strTypes) => {
        const callPromise=contract.call(func, {
            args: strArgs,
            options: {
              ttl: 55
            }
          });
        assert.isFulfilled(callPromise, 'Could not call '+func+' on contract:'+contract);
        const taskResult = await callPromise;
        //Assert
        const taskResultDecoded = await taskResult.decode(strTypes);
        return taskResultDecoded.value;
    },
    callFunction: async (contract,func, strArgs,strTypes) => {
        const callPromise=contract.call(func, {
            args: strArgs,
            options: {
              ttl: 55,
              //gas: 1000000000
            }
          });
        assert.isFulfilled(callPromise, 'Could not call '+func+' on contract:'+contract);
        const taskResult = await callPromise;
        //Assert
        const taskResultDecoded = await taskResult.decode(strTypes);
        return taskResultDecoded.value;
    },
}