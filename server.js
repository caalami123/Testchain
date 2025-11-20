const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Hardhat gas-free provider
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// TOKEN INFO
const tokenAddress = "PUT_YOUR_DEPLOYED_TOKEN_ADDRESS_HERE";

const tokenAbi = [
    "function balanceOf(address) view returns(uint256)",
    "function transfer(address,uint256) returns(bool)",
    "function mint(address,uint256)"
];

const token = new ethers.Contract(tokenAddress, tokenAbi, provider);

// ⛽ Gas-free deployer (first account)
let deployerSigner;
(async () => {
    const accounts = await provider.listAccounts();
    deployerSigner = await provider.getSigner(accounts[0]);
})();

// ⭐ 1) Create wallet + auto mint 100 TT
app.post("/createWallet", async (req,res)=>{
    const wallet = ethers.Wallet.createRandom();
    const signer = deployerSigner;

    await token.connect(signer).mint(wallet.address, ethers.parseUnits("100",18));

    res.json({
        address: wallet.address,
        privateKey: wallet.privateKey
    });
});

// ⭐ 2) Import wallet
app.post("/importWallet", async (req,res)=>{
    try {
        const wallet = new ethers.Wallet(req.body.privateKey);
        res.json({ address: wallet.address, privateKey: wallet.privateKey });
    } catch {
        res.json({ error: "Invalid private key" });
    }
});

// ⭐ 3) Transfer tokens (gas-free)
app.post("/sendToken", async (req,res)=>{
    const { fromPrivateKey, to, amount } = req.body;
    try {
        const signer = new ethers.Wallet(fromPrivateKey, provider);
        const tokenWithSigner = token.connect(signer);

        const tx = await tokenWithSigner.transfer(to, ethers.parseUnits(amount.toString(),18));
        await tx.wait();

        res.json({ txHash: tx.hash });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ⭐ 4) Check balance
app.get("/balance/:address", async (req,res)=>{
    try {
        const bal = await token.balanceOf(req.params.address);
        res.json({ balance: ethers.formatUnits(bal,18) });
    } catch {
        res.json({ error: "Invalid address" });
    }
});

app.listen(3000, ()=> console.log("Backend running on 3000"));
