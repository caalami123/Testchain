async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const Token = await ethers.getContractFactory("MyToken");
    const token = await Token.deploy(ethers.parseUnits("1000000", 18));
    await token.deployed();

    console.log("Token deployed to:", token.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
