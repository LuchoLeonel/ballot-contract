import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config()

const PROPOSALS = ["p1", "p2", "p3"];

async function main() {
  //Get arguments from script run
  const args = process.argv;
  let proposals = args.slice(2);
  if(proposals.length === 0) { proposals = PROPOSALS; }
  //Get provider to connect to network
  const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PRIVATE_KEY);
  //Get wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  //Connect wallet to the provider
  const signer = wallet.connect(provider);
  //Create contract factory
  const ballotFactory = new Ballot__factory(signer)
  //Deploy contract
  const ballotContract = await ballotFactory.deploy(proposals
    .map(prop =>ethers.utils.formatBytes32String(prop)));
  //Wait till contract is deployed
  await ballotContract.deployTransaction.wait();
  //Output contract address
  console.log(`Contract Address: ${ballotContract.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
