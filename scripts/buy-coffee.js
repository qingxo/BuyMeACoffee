// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


// Returns the Ethers balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function printBalance(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ind:${idx} balance:`, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases;
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`)
  }
}


async function main() {
  // Get example accounts.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  await buyMeACoffee.deployed();
  console.log("BuymeACoffee deployed to", buyMeACoffee.address);

  // Check balances before the coffee puchase
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log(" === start ===");
  await printBalance(addresses);

  // Buy the owner a few coffees;
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("luoya", "have a nice day", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("kaka", "you are best", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("wowo", "you are great", tip);

  // Check balances after coffee purchase
  console.log(" === buy Coffee now ===");
  await printBalance(addresses);

  // withdraw funds
  await buyMeACoffee.connect(owner).widthdrawTips();

  // Check balance after withdraw;
  console.log(" === after withdraw now ===");
  await printBalance(addresses);


  // print the all info on chain
  const memos = await buyMeACoffee.connect(tipper).getMemos();
  await printMemos(memos);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
