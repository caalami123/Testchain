require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",

  networks: {
    // Local Hardhat in-memory network (gas free)
    hardhat: {
      initialBaseFeePerGas: 0,   // Gas == 0
      gasPrice: 0                // No gas price
    },

    // Localhost (ganache/anvil/hardhat-node)
    localhost: {
      url: "http://127.0.0.1:8545"
      // Do NOT use mnemonic here unless needed
    }
  }
};
