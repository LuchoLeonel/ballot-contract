import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["aabb", "Proposal 2", "Proposal 3"];
function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let i = 0; i < array.length; i++) {
        bytes32Array.push(ethers.utils.formatBytes32String(array[i]));
    }
    return bytes32Array;
}

describe("Ballot", () => {
    let ballotContract: Ballot;

    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        ballotContract = await ballotContractFactory.deploy(
            convertStringArrayToBytes32(PROPOSALS)
        );
        await ballotContract.deployTransaction.wait();
    });

    describe("when the contract is deployed", () => {
        it("sets the deployer address as chairperson", async () => {
            const signers = await ethers.getSigners();
            const deployer = signers[0].address;
            const chairperson = await ballotContract.chairperson();
            expect(chairperson).to.equal(deployer);
        });

        it("sets voting weight for the charperson as 1", async () => {
            const chairperson = await ballotContract.chairperson();
            const voter = await ballotContract.voters(chairperson);
            const votingWeight = voter.weight;
            expect(votingWeight).to.eq(1);
        });

        it("has the provided proposals", async () => {
            // console.log(proposalsFromContract);
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposalsFromContract = await ballotContract.proposals(
                    index
                );
                expect(
                    ethers.utils.parseBytes32String(proposalsFromContract.name)
                ).to.equal(PROPOSALS[index]);
            }
        });

        it("has zero votes for all proposals", async () => {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposalsFromContract = await ballotContract.proposals(
                    index
                );
                expect(proposalsFromContract.voteCount).to.equal(0);
            }
        });
    });
});

describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    let ballotContract: Ballot;
    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        ballotContract = await ballotContractFactory.deploy(
            convertStringArrayToBytes32(PROPOSALS)
        );
        await ballotContract.deployTransaction.wait();
        await ballotContract.deployed();
    });

    it("gives right to vote for another address", async function () {
        const signers = await ethers.getSigners();
        const notChairperson = signers[1];
        const otherVoter = signers[2].address;

        await expect(
            ballotContract.connect(notChairperson).giveRightToVote(otherVoter)
        ).to.be.revertedWith("Only chairperson can give right to vote.");
    });

    it("can not give right to vote for someone that has voted", async function () {
        const accounts = await ethers.getSigners();
        const accounthasRightToVote = accounts[1].address;
        const voterProfile = await ballotContract.voters(accounthasRightToVote);
        
        expect(voterProfile.voted).to.be.false;
        await ballotContract.giveRightToVote(accounthasRightToVote);
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
        const accounts = await ethers.getSigners();
        const accounthasRightToVote = accounts[1].address;
        const voterProfile = await ballotContract.voters(accounthasRightToVote);
        
        expect(voterProfile.weight).to.eq(0);
        await ballotContract.giveRightToVote(accounthasRightToVote);
    });
});

describe("when the voter interact with the vote function in the contract", function () {
    // TODO
    it("should register the vote", async () => {
        throw Error("Not implemented");
    });
});

describe("when the voter interact with the delegate function in the contract", function () {
    // TODO
    it("should transfer voting power", async () => {
        throw Error("Not implemented");
    });
});

describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    // TODO
    it("should revert", async () => {
        throw Error("Not implemented");
    });
});

describe("when the an attacker interact with the vote function in the contract", function () {
    // TODO
    it("should revert", async () => {
        throw Error("Not implemented");
    });
});

describe("when the an attacker interact with the delegate function in the contract", function () {
    // TODO
    it("should revert", async () => {
        throw Error("Not implemented");
    });
});

describe("when someone interact with the winningProposal function before any votes are cast", function () {
    // TODO
    it("should return 0", async () => {
        throw Error("Not implemented");
    });
});

describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    // TODO
    it("should return 0", async () => {
        throw Error("Not implemented");
    });
});

describe("when someone interact with the winnerName function before any votes are cast", function () {
    // TODO
    it("should return name of proposal 0", async () => {
        throw Error("Not implemented");
    });
});

describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // TODO
    it("should return name of proposal 0", async () => {
        throw Error("Not implemented");
    });
});

describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("should return the name of the winner proposal", async () => {
        throw Error("Not implemented");
    });
});
