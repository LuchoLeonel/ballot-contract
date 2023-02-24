import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config()

async function main() {
    const provider = new ethers.providers.InfuraProvider("goerli", "a607b5016eef412a9c44f636bf72a406");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
    const signer = wallet.connect(provider);
    const ballotFactory = new Ballot__factory(signer)
    const ballotContract = ballotFactory.attach('0x275957a9e0040a662775C2a7C873a4147248387d');
    await ballotContract.winningProposal();
    const winner = await ballotContract.winnerName();
    console.log(`And the winner is ${ethers.utils.parseBytes32String(winner)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
