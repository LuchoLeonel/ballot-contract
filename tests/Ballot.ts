import { expect } from "chai";
import { ethers } from "hardhat";
import { describe } from "mocha";
import { Ballot__factory } from "../typechain-types/Ballot";

describe("Ballot", async function () {
    const starting = async () => {
        const args = process.argv;
        const proposals = args.slice(2);
        if (proposals.length <= 0) throw new Error("Missing parameters: proposals");
        
        const provider = new ethers.providers.InfuraProvider(
            "goerli",
            process.env.INFURA_API_KEY
        );
        
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey || privateKey.length <= 0)
            throw new Error("Missing environment: Private key");
        const wallet = new ethers.Wallet(privateKey);
        console.log(`Connected to the wallet address ${wallet.address}`);
        const signer = wallet.connect(provider);
        const balance = await signer.getBalance();
        console.log(`Wallet balance: ${balance} Wei`);
        
        console.log("Deploying Ballot contract");
        console.log("Proposals: ");
        proposals.forEach((element, index) => {
            console.log(`Proposal N. ${index + 1}: ${element}`);
        });
        
        const ballotContractFactory = new Ballot__factory(signer);
        console.log("Deploying contract ...");
        const ballotContract = await ballotContractFactory.deploy(
            ethers.utils.convertStringArrayToBytes32(proposals)
        );
        const deployTxReceipt = await ballotContract.deployTransaction.wait();
        console.log(
            `The Ballot contract was deployed at the address ${ballotContract.address}`
        );
        console.log({ deployTxReceipt });
        return ballotContract;
        }

    it("Should give votes and vote", async function () {
        const ballotContract = await starting();
    });

});
