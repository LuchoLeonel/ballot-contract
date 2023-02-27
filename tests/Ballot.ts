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

let ballotContract: Ballot;
beforeEach(async () => {
    const ballotContractFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotContractFactory.deploy(
        convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployTransaction.wait();
    await ballotContract.deployed();
});

describe("Ballot", () => {
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
    it("should register the vote", async () => {
        const accounts = await ethers.getSigners();
        const voterAccount = accounts[1];
        await ballotContract.giveRightToVote(voterAccount.address);

        const proposalIndex = 1;
        let proposal = await ballotContract.proposals(proposalIndex);
        const proposalVoteCountBeforeVote = proposal.voteCount;
        
        await ballotContract.connect(voterAccount).vote(proposalIndex);
        proposal = await  ballotContract.proposals(proposalIndex);
        const proposalVoteCountAfterVote = proposal.voteCount;
        expect(proposalVoteCountAfterVote).to.be.greaterThan(proposalVoteCountBeforeVote);
    });
});

describe("when the voter interact with the delegate function in the contract", function () {
    // TODO
    it("should transfer voting power", async () => {
        const accounts = await ethers.getSigners();

        await ballotContract.giveRightToVote(accounts[1].address);
        await ballotContract.giveRightToVote(accounts[2].address);
        await ballotContract.connect(accounts[1]).delegate(accounts[2].address);
        await ballotContract.connect(accounts[2]).vote(0)
    });
});

describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    it("should revert", async () => {
        const accounts = await ethers.getSigners();

        await expect(ballotContract.connect(accounts[1]).giveRightToVote(accounts[2].address))
        .to.be.reverted
    });
});

describe("when the an attacker interact with the vote function in the contract", function () {
    it("should revert", async () => {
        const accounts = await ethers.getSigners();
        const unauthorizedAccount = accounts[1];

        await expect(ballotContract.connect(unauthorizedAccount).vote(1))
        .to.be.revertedWith("Has no right to vote");
    });
});

describe("when the an attacker interact with the delegate function in the contract", function () {
    it("should revert unathorized account", async () => {
        const accounts = await ethers.getSigners();
        const unauthorizedAccount = accounts[1];

        await expect(ballotContract.connect(unauthorizedAccount).delegate(accounts[2].address))
        .to.be.revertedWith("You have no right to vote");
    });

    it("should revert account that already voted", async () => {
        const accounts = await ethers.getSigners();
        const accountThatVoted = accounts[1];

        await ballotContract.giveRightToVote(accountThatVoted.address);
        await ballotContract.connect(accountThatVoted).vote(1);

        await expect(ballotContract.connect(accountThatVoted).delegate(accounts[2].address))
        .to.be.revertedWith("You already voted.");
    });

    it("should revert account that delegates to itself",async () => {
        const accounts = await ethers.getSigners();
        const accountThatVoted = accounts[1];

        await ballotContract.giveRightToVote(accountThatVoted.address);

        await expect(ballotContract.connect(accountThatVoted).delegate(accountThatVoted.address))
        .to.be.revertedWith("Self-delegation is disallowed.");
    })
});


describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("should return 0", async () => {
        const winningProposalCount = await ballotContract.winningProposal();
        expect(winningProposalCount).to.be.equal(0);
    });
});


describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("should return 0", async () => {
        await ballotContract.vote(0);
        const winningProposalCount = await ballotContract.winningProposal();
        expect(winningProposalCount).to.be.equal(0);
    });
});

describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("should return name of proposal 0", async () => {
        const winnerNameBytes32 = await ballotContract.winnerName();
        const decodedWinnerName = ethers.utils.parseBytes32String(winnerNameBytes32);
        expect(decodedWinnerName).to.be.equal(PROPOSALS[0]);
    });
});

describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    it("should return name of proposal 0", async () => {
        await ballotContract.vote(0);
        const winnerNameBytes32 = await ballotContract.winnerName();
        const decodedWinnerName = ethers.utils.parseBytes32String(winnerNameBytes32);
        expect(decodedWinnerName).to.be.equal(PROPOSALS[0])
    });
});

describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    it("should return the name of the winner proposal", async () => {
        const accounts = await ethers.getSigners();

        const mostVotedProposal = PROPOSALS[0];

        await ballotContract.vote(0);

        await ballotContract.giveRightToVote(accounts[1].address);
        await ballotContract.connect(accounts[1]).vote(1);
        
        await ballotContract.giveRightToVote(accounts[2].address);
        await ballotContract.connect(accounts[2]).vote(2);

        await ballotContract.giveRightToVote(accounts[3].address);
        await ballotContract.connect(accounts[3]).vote(0);

        await ballotContract.giveRightToVote(accounts[4].address);
        await ballotContract.connect(accounts[4]).vote(0);

        const winnerProposalNameBytes32 = await ballotContract.winnerName();
        const decodedWinnerName = ethers.utils.parseBytes32String(winnerProposalNameBytes32);

        expect(mostVotedProposal).to.be.equal(decodedWinnerName);
    });
});
