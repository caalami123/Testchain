async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(1000000); // 1,000,000 MTK
    await token.deployed();

    console.log("Token deployed to:", token.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
