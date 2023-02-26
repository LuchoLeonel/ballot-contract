import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from 'dotenv';
dotenv.config();


//yarn run ts-node --files ./scripts/DelegateVote.ts "0x275957a9e0040a662775C2a7C873a4147248387d" "The receiver's address"
async function main() {
    const args = process.argv;

    const ballotContractAddress = args.slice(2, 3)[0];
    const delegatedVoterAddress = args.slice(3, 4)[0];

    if (!ballotContractAddress || ballotContractAddress.length <= 0) {
        throw new Error("Missing ballot contract address parameter");
    }

    if (!delegatedVoterAddress || delegatedVoterAddress.length <= 0) {
        throw new Error("Missing delegatedVoterAddress parameter");
    }

    console.log(`delegatedVoterAddress is ${delegatedVoterAddress}`)

    const provider = new ethers.providers.InfuraProvider("goerli", "a607b5016eef412a9c44f636bf72a406");
    
    const privateKey = process.env.DELEGATING_VOTER_PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0)
      throw new Error("Missing environment: Mnemonic seed");
    const wallet = new ethers.Wallet(privateKey);
    console.log(`Connected to the wallet address ${wallet.address}`);
    const signer = wallet.connect(provider);
  
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = ballotContractFactory.attach(ballotContractAddress);
    // The Delegation...
    const txReceipt =  await ballotContract.delegate(delegatedVoterAddress,{
        gasLimit: 100000
      });
    console.log(`Delegation receipt: ${txReceipt}`)
  }

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });