import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();


//yarn run ts-node --files ./scripts/CastVote.ts "0x275957a9e0040a662775C2a7C873a4147248387d" "proposal number (0, 1 or 2)"
async function main() {
    const args = process.argv;
    const ballotContractAddress = args.slice(2, 3)[0];
    const proposalIndex = args.slice(3, 4)[0];

    if (!ballotContractAddress || ballotContractAddress.length <= 0) {
        throw new Error("Missing ballot contract address parameter");
    }

    if (!proposalIndex || proposalIndex.length <= 0) {
        throw new Error("Missing proposalIndex parameter");
    }

    console.log(`proposalIndex is ${proposalIndex}`)
  
    const provider = new ethers.providers.InfuraProvider("goerli", "a607b5016eef412a9c44f636bf72a406");

    const privateKey = process.env.VOTER_PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0)
      throw new Error("Missing environment: Mnemonic seed");
    const wallet = new ethers.Wallet(privateKey);
    console.log(`Connected to the wallet address ${wallet.address}`);
    const signer = wallet.connect(provider);

    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = ballotContractFactory.attach(ballotContractAddress);
    // The Vote Casting...
    const txReceipt =  await ballotContract.vote(proposalIndex,{
        gasLimit: 100000
      });
    console.log(`Vote receipt: ${txReceipt}`)
  }

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });