// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ballot {
    struct Voter {
        uint weight;
        bool voted;
        uint vote;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    address[] public votersAddresses;
    Proposal[] public proposals;

    uint public numVotes;
    mapping(uint => uint) public voteTimestamps;

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address voter) public {
        require(msg.sender == chairperson, "Only the chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0, "The voter already has a weight.");
        voters[voter].weight = 1;
    }

    function vote(uint proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight > 0, "You have no right to vote.");
        require(!sender.voted, "You already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
        voteTimestamps[numVotes] = block.timestamp;
        votersAddresses.push(msg.sender);
        numVotes++;
    }

    function winningProposal() public view returns (uint) {
        uint winningProposal_ = 0;
        uint winningVoteCount_ = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount_) {
                winningProposal_ = i;
                winningVoteCount_ = proposals[i].voteCount;
            }
        }

        if (winningVoteCount_ == 0) {
            return proposals.length; // no winner
        }

        uint runnerUpProposal_ = proposals.length;
        uint runnerUpVoteCount_ = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (i != winningProposal_ && proposals[i].voteCount > runnerUpVoteCount_) {
                runnerUpProposal_ = i;
                runnerUpVoteCount_ = proposals[i].voteCount;
            }
        }

        if (winningVoteCount_ == runnerUpVoteCount_) {
            uint earliestTimestamp = block.timestamp;
            for (uint i = 0; i < numVotes; i++) {
                uint proposal = voters[votersAddresses[i]].vote;
                if (proposals[proposal].voteCount == winningVoteCount_ && voteTimestamps[i] < earliestTimestamp) {
                    winningProposal_ = proposal;
                    earliestTimestamp = voteTimestamps[i];
                }
            }
        }

        return winningProposal_;
    }
}