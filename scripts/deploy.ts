import { ethers } from "hardhat";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config()

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const args = process.argv;
  let proposals = args.slice(2);
  if(proposals.length === 0) { proposals = PROPOSALS; }
  const provider = ethers.getDefaultProvider('goerli');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const signer = wallet.connect(provider);
  const ballotFactory = new Ballot__factory(signer)
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  await ballotContract.deployTransaction.wait();
  console.log(`contract deployed. address: ${ballotContract.address}`)
  // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
