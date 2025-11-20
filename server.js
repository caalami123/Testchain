const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Local Hardhat provider
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Wallets mapping: address -> privateKey
let wallets = {};

// Smart contract info
const tokenAddress = "YOUR_DEPLOYED_TOKEN_ADDRESS"; // ka copy deploy step
const tokenAbi = [
    "function balanceOf(address) view returns(uint)",
    "function transfer(address to, uint amount) returns(bool)",
    "function mint(address to, uint amount)"
];

const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

// Create wallet
app.post("/createWallet", async (req,res)=>{
    const wallet = ethers.Wallet.createRandom();
    wallets[wallet.address] = wallet.privateKey;

    // Mint 100 TT once
    const signer = wallet.connect(provider);
    const tokenWithSigner = tokenContract.connect(signer);
    await tokenWithSigner.mint(wallet.address, ethers.parseUnits("100", 18));

    res.json({ address: wallet.address, privateKey: wallet.privateKey });
});

// Import wallet
app.post("/importWallet", async (req,res)=>{
    const { privateKey } = req.body;
    if(!privateKey) return res.json({error:"No private key"});
    const wallet = new ethers.Wallet(privateKey);
    wallets[wallet.address] = privateKey;
    res.json({ address: wallet.address, privateKey });
});

// Send tokens
app.post("/sendEth", async (req,res)=>{
    const { fromPrivateKey, to, amount } = req.body;
    if(!fromPrivateKey || !to || !amount) return res.json({error:"Missing params"});
    const wallet = new ethers.Wallet(fromPrivateKey, provider);
    const tokenWithSigner = tokenContract.connect(wallet);

    try {
        const tx = await tokenWithSigner.transfer(to, ethers.parseUnits(amount.toString(), 18));
        await tx.wait();
        res.json({ txHash: tx.hash });
    } catch(e){
        res.json({error: e.message});
    }
});

// Check balance
app.get("/balance/:address", async (req,res)=>{
    const { address } = req.params;
    try{
        const bal = await tokenContract.balanceOf(address);
        res.json({ balance: ethers.formatUnits(bal,18) });
    } catch(e){
        res.json({error: e.message});
    }
});

app.listen(3000,()=>console.log("Server running on port 3000"));
