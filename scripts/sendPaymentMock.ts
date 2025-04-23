import {ethers} from "hardhat";

async function main() {
    const [owner, user1, user2] = await ethers.getSigners();

    const idrxAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <- paste from your deploy log
    const paymentAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // <- paste from your deploy log

    const idrx = await ethers.getContractAt("MockIDRX", idrxAddress);
    const payment = await ethers.getContractAt("IDRXPayment", paymentAddress);

    // Send some tokens from owner to user1
    await idrx.transfer(user1.address, ethers.parseEther("100"));

    // Approve the payment contract to spend on behalf of user1
    await idrx.connect(user1).approve(paymentAddress, ethers.parseEther("50"));

    // Call the sendIDRX function from user1 to user2
    const tx = await payment.connect(user1).sendIDRX(user2.address, ethers.parseEther("25"));
    await tx.wait();

    console.log("✅ Payment of 25 IDRX sent from user1 to user2.");

    const balance = await idrx.balanceOf(user2.address);
    console.log(ethers.formatEther(balance));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
