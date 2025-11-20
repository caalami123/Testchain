const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// SIMPLE GASLESS LEDGER
let wallets = {};
let balances = {};  // token balances
let ledger = [];    // fake blockchain blocks

// Create wallet (gasless network)
app.post("/createWallet", (req,res)=>{
    const { randomUUID } = require("crypto");

    const privateKey = randomUUID().replace(/-/g,"");
    const address = "WALLET-" + privateKey.slice(0,8);

    // Save
    wallets[address] = privateKey;

    // Mint 100 tokens Free
    balances[address] = 100;

    ledger.push({
        from: "GENESIS",
        to: address,
        amount: 100,
        time: Date.now()
    });

    res.json({ address, privateKey });
});

// Import wallet
app.post("/importWallet", (req,res)=>{
    const key = req.body.privateKey;
    if(!key) return res.json({error:"No private key"});

    const address = "WALLET-" + key.slice(0,8);
    wallets[address] = key;

    if(!balances[address]) balances[address] = 0;

    res.json({ address, privateKey:key });
});

// Send tokens
app.post("/send", (req,res)=>{
    const { fromPrivateKey, to, amount } = req.body;

    const from = "WALLET-" + fromPrivateKey.slice(0,8);
    if(balances[from] < amount) return res.json({error:"Not enough tokens"});

    balances[from] -= amount;
    balances[to] = (balances[to] || 0) + Number(amount);

    ledger.push({
        from,
        to,
        amount,
        time: Date.now()
    });

    res.json({ status:"success" });
});

// Check balance
app.get("/balance/:address",(req,res)=>{
    const address = req.params.address;
    res.json({ balance: balances[address] || 0 });
});

app.listen(3000,()=>console.log("GASLESS blockchain running"));
