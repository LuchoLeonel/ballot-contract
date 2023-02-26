import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config()

async function main() {

  const args = process.argv;
  const proposal = args.slice(2)[0];

  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
    const signer = wallet.connect(provider);
    const ballotFactory = new Ballot__factory(signer)
    const ballotContract = ballotFactory.attach(process.env.CONTRACT_ADDRESS!);
    await ballotContract.vote(Number(proposal));

    const balance = await signer.getBalance();
    console.log(`Balance: ${balance} Wei`);

    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
