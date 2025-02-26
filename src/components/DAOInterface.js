import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './DAOInterface.css';
import LoadingSpinner from './LoadingSpinner';

// Sample DAO ABI - Replace with your actual DAO contract ABI
const daoABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "MembershipAcquired",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "enum SimpleDAO.ProposalType",
        "name": "proposalType",
        "type": "uint8"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "support",
        "type": "bool"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newPeriod",
        "type": "uint256"
      }
    ],
    "name": "VotingPeriodUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MEMBER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "enum SimpleDAO.ProposalType",
        "name": "proposalType",
        "type": "uint8"
      },
      {
        "internalType": "bytes",
        "name": "proposalData",
        "type": "bytes"
      }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDAOBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getProposal",
    "outputs": [
      {
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "yesVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "internalType": "enum SimpleDAO.ProposalType",
        "name": "proposalType",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "joinDAO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minVotesRequired",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "yesVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noVotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      },
      {
        "internalType": "enum SimpleDAO.ProposalType",
        "name": "proposalType",
        "type": "uint8"
      },
      {
        "internalType": "bytes",
        "name": "proposalData",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "support",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
  ];

function DAOInterface({ account, network }) {
  const [contract, setContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProposal, setNewProposal] = useState('');
  const [notification, setNotification] = useState(null);
  const [votingStates, setVotingStates] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Remove the automatic notification timeout
  useEffect(() => {
    if (notification && !notification.isError) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const isVotingOpen = (endTime) => {
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    return currentTime < parseInt(endTime);
  };

  // Add this function to check if an account has voted
  const hasVoted = async (proposalId, voterAddress) => {
    try {
      const hasVoted = await contract.hasVoted(proposalId, voterAddress);
      return hasVoted;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeContract = async () => {
      try {
        setLoading(true);
        setError(null);

        const contractAddress = network === 'mainnet'
          ? process.env.REACT_APP_DAO_CONTRACT_MAINNET
          : process.env.REACT_APP_DAO_CONTRACT_SEPOLIA;

        if (!contractAddress) {
          throw new Error(`No DAO contract address configured for ${network} network`);
        }

        // Create a contract instance with signer for transactions
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const daoContract = new ethers.Contract(
          contractAddress,
          daoABI,
          signer  // Use signer instead of provider
        );

        setContract(daoContract);
        
        // Load actual proposals
        const proposalCount = await daoContract.proposalCount();
        const loadedProposals = [];

        // Load proposals in reverse order (newest first)
        for (let i = proposalCount - 1; i >= 0; i--) {
          const proposal = await daoContract.proposals(i);
          const userHasVoted = await hasVoted(i, account.address);
          
          loadedProposals.push({
            id: i.toString(),
            description: proposal.description,
            forVotes: proposal.yesVotes.toString(),
            againstVotes: proposal.noVotes.toString(),
            executed: proposal.executed,
            canceled: false,
            endTime: proposal.endTime.toString(),
            hasVoted: userHasVoted
          });
        }
        
        setProposals(loadedProposals);
      } catch (err) {
        console.error('Error initializing DAO contract:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (account && window.ethereum) {
      initializeContract();
    }
  }, [account, network]);

  const handleVote = async (proposalId, support) => {
    try {
      if (!contract) {
        throw new Error('DAO contract not initialized');
      }

      setLoading(true);
      console.log('Voting on proposal:', proposalId, 'Support:', support); // Debug log

      // Call the contract's vote function
      const tx = await contract.vote(proposalId, support);
      console.log('Vote transaction sent:', tx.hash); // Debug log

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Vote transaction confirmed:', receipt); // Debug log

      // Get updated vote counts
      const updatedProposal = await contract.proposals(proposalId);

      // Update the proposals state with new vote counts and voting status
      setProposals(prevProposals => 
        prevProposals.map(p => 
          p.id === proposalId
            ? {
                ...p,
                forVotes: updatedProposal.yesVotes.toString(),
                againstVotes: updatedProposal.noVotes.toString(),
                hasVoted: true
              }
            : p
        )
      );

      // Set the voting state to show the vote was recorded
      setVotingStates({
        ...votingStates,
        [proposalId]: {
          type: support ? 'success' : 'error',
          message: `Successfully voted ${support ? 'for' : 'against'} proposal ${proposalId}`,
          voted: true
        }
      });

    } catch (error) {
      console.error('Error voting:', error);
      setVotingStates({
        ...votingStates,
        [proposalId]: {
          type: 'error',
          message: error.message || 'Error voting. Please try again.',
          voted: false
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      if (!contract) {
        throw new Error('DAO contract not initialized');
      }

      if (!newProposal.trim()) {
        throw new Error('Proposal description cannot be empty');
      }

      setLoading(true);

      console.log('Creating proposal:', newProposal); // Debug log

      // Create the proposal
      const tx = await contract.createProposal(
        newProposal.trim(),
        0, // Basic proposal type
        '0x' // Empty bytes for basic proposal
      );

      console.log('Transaction sent:', tx.hash); // Debug log

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt); // Debug log

      // Clear the form and show success message
      setNewProposal('');
      setError({
        type: 'success',
        message: 'Proposal created successfully!'
      });

      // Refresh the proposals list
      const proposalCount = await contract.proposalCount();
      const newProposalData = await contract.proposals(proposalCount - 1);
      
      setProposals(prevProposals => [{
        id: proposalCount.toString(),
        description: newProposalData.description,
        forVotes: newProposalData.yesVotes.toString(),
        againstVotes: newProposalData.noVotes.toString(),
        executed: newProposalData.executed,
        canceled: false,
        endTime: newProposalData.endTime.toString()
      }, ...prevProposals]);

    } catch (error) {
      console.error('Error creating proposal:', error);
      setError({
        type: 'error',
        message: error.message || 'Error creating proposal. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleErrorClose = () => {
    setNotification(null);
  };

  const connectDAO = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      setLoading(true);
      setError(null);
      
      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && accounts[0].toLowerCase() === account.address.toLowerCase()) {
        // Create contract instance even when already connected
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = network === 'mainnet'
          ? process.env.REACT_APP_DAO_CONTRACT_MAINNET
          : process.env.REACT_APP_DAO_CONTRACT_SEPOLIA;

        const daoContract = new ethers.Contract(
          contractAddress,
          daoABI,
          signer
        );
        
        setContract(daoContract);
        setIsConnected(true);
        setError({
          type: 'success',
          message: 'Wallet is already connected. Click Continue to proceed.'
        });
        return;
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Rest of the connection logic...
      const contractAddress = network === 'mainnet'
        ? process.env.REACT_APP_DAO_CONTRACT_MAINNET
        : process.env.REACT_APP_DAO_CONTRACT_SEPOLIA;

      if (!contractAddress) {
        throw new Error(`No DAO contract address configured for ${network} network`);
      }

      // Create contract instance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const daoContract = new ethers.Contract(contractAddress, daoABI, signer);

      try {
        // Check if already a member
        const memberRole = await daoContract.MEMBER_ROLE();
        const isMember = await daoContract.hasRole(memberRole, await signer.getAddress());
        
        if (isMember) {
          // If already a member, just connect without joining
          setContract(daoContract);
          setIsConnected(true);
          setError({
            type: 'success',
            message: 'Successfully connected to DAO'
          });
        } else {
          // If not a member, try to join
          const tx = await daoContract.joinDAO();
          await tx.wait();
          setContract(daoContract);
          setIsConnected(true);
          setError({
            type: 'success',
            message: 'Successfully joined and connected to DAO'
          });
        }
      } catch (error) {
        if (error.message.includes('Already a member')) {
          // If the error is about already being a member, still connect
          setContract(daoContract);
          setIsConnected(true);
          setError({
            type: 'success',
            message: 'Successfully connected to DAO (Already a member)'
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error connecting to DAO:', error);
      setError({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error.type === 'success' || error.type === 'warning') {
      // Only clear the error message but maintain the connection
      setError(null);
    } else {
      // For actual errors, reset everything
      setError(null);
      setIsConnected(false);
    }
  };

  // Get DAO address based on network
  const getDaoAddress = () => {
    return network === 'mainnet'
      ? process.env.REACT_APP_DAO_CONTRACT_MAINNET
      : process.env.REACT_APP_DAO_CONTRACT_SEPOLIA;
  };

  if (loading) {
    return (
      <div className="dao-loading">
        <LoadingSpinner />
        <p>Loading DAO interface...</p>
      </div>
    );
  }

  return (
    <div className="dao-interface">
      <h2>DAO Governance</h2>
      
      {error ? (
        <div className={`dao-connect-message ${error.type}`}>
          <p>{error.message}</p>
          <button onClick={clearError} className="error-close-btn">
            {error.type === 'error' ? 'Try Again' : 'Continue'}
          </button>
        </div>
      ) : !isConnected ? (
        <div className="connect-dao">
          <p>Connect your wallet to participate in DAO governance</p>
          <div className="dao-address">
            <p>DAO Contract Address:</p>
            <code>{getDaoAddress()}</code>
          </div>
          <button onClick={connectDAO} disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Connect to DAO'}
          </button>
        </div>
      ) : (
        <>
          <div className="create-proposal">
            <h3>Create Proposal</h3>
            <form onSubmit={handleCreateProposal}>
              <textarea
                value={newProposal}
                onChange={(e) => setNewProposal(e.target.value)}
                placeholder="Enter your proposal description"
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Submit Proposal'}
              </button>
            </form>
          </div>

          <div className="proposals-list">
            <h3>Active Proposals</h3>
            {proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-item">
                <h4>Proposal #{proposal.id}</h4>
                <p className="proposal-description">{proposal.description}</p>
                <div className="vote-stats">
                  <span>For: {proposal.forVotes}</span>
                  <span>Against: {proposal.againstVotes}</span>
                  {proposal.executed && <span className="executed">Executed</span>}
                  {proposal.canceled && <span className="canceled">Canceled</span>}
                  {!isVotingOpen(proposal.endTime) && <span className="expired">Voting Ended</span>}
                </div>
                {!proposal.executed && !proposal.canceled && isVotingOpen(proposal.endTime) && !proposal.hasVoted && (
                  <div className="vote-buttons">
                    {votingStates[proposal.id] ? (
                      <div className={`vote-message ${votingStates[proposal.id].type}`}>
                        {votingStates[proposal.id].message}
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleVote(proposal.id, true)}
                          className="vote-for"
                        >
                          Vote For
                        </button>
                        <button 
                          onClick={() => handleVote(proposal.id, false)}
                          className="vote-against"
                        >
                          Vote Against
                        </button>
                      </>
                    )}
                  </div>
                )}
                {proposal.hasVoted && (
                  <div className="vote-status">
                    <span>You have already voted on this proposal</span>
                  </div>
                )}
              </div>
            ))}
            {proposals.length === 0 && (
              <p className="no-proposals">No active proposals</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DAOInterface; 