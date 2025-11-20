const express = require('express');
const { ethers } = require('ethers');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// --- Ethereum provider (Goerli testnet) ---
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID");

// --- Wallet creation endpoint ---
app.post('/createWallet', (req,res)=>{
    const wallet = ethers.Wallet.createRandom();
    res.json({ address: wallet.address, privateKey: wallet.privateKey });
});

// --- Import wallet endpoint ---
app.post('/importWallet', (req,res)=>{
    const { privateKey } = req.body;
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        res.json({ address: wallet.address, privateKey: wallet.privateKey });
    } catch(e){
        res.status(400).json({ error: "Invalid private key" });
    }
});

// --- Send ETH transaction ---
app.post('/sendEth', async (req,res)=>{
    const { fromPrivateKey, to, amount } = req.body;
    try{
        const wallet = new ethers.Wallet(fromPrivateKey, provider);
        const tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amount.toString())
        });
        await tx.wait();
        res.json({ success:true, txHash: tx.hash });
    }catch(e){
        res.status(400).json({ error: e.message });
    }
});

// --- Check balance ---
app.get('/balance/:address', async (req,res)=>{
    try{
        const balance = await provider.getBalance(req.params.address);
        res.json({ balance: ethers.formatEther(balance) });
    }catch(e){
        res.status(400).json({ error:e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
