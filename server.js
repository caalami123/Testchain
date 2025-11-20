const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to local Hardhat fork
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Temporary in-memory wallet storage
let wallets = {};

// Create new wallet
app.post('/createWallet', async (req, res) => {
    const wallet = ethers.Wallet.createRandom();
    wallets[wallet.address] = wallet.privateKey;
    res.json({ address: wallet.address, privateKey: wallet.privateKey });
});

// Import wallet
app.post('/importWallet', async (req, res) => {
    const { privateKey } = req.body;
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        wallets[wallet.address] = wallet.privateKey;
        res.json({ address: wallet.address, privateKey: wallet.privateKey });
    } catch (err) {
        res.json({ error: 'Invalid private key' });
    }
});

// Check balance
app.get('/balance/:address', async (req, res) => {
    try {
        const balance = await provider.getBalance(req.params.address);
        res.json({ balance: ethers.formatEther(balance) });
    } catch (err) {
        res.json({ error: 'Address not found' });
    }
});

// Send ETH
app.post('/sendEth', async (req, res) => {
    const { fromPrivateKey, to, amount } = req.body;
    try {
        const wallet = new ethers.Wallet(fromPrivateKey, provider);
        const tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amount.toString())
        });
        await tx.wait();
        res.json({ txHash: tx.hash });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
