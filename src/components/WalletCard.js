import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './WalletCard.css';
import LoadingSpinner from './LoadingSpinner';

// Minimal ERC20 ABI for token balance and decimals
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

function WalletCard({ account, balance, network }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [nfts, setNfts] = useState([]);
  const [displayBalance, setDisplayBalance] = useState('0.00000');
  const [isUpdating, setIsUpdating] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const updateBalance = async () => {
    try {
      if (!account) return;
      
      setIsUpdating(true);
      // Create a new provider based on the current network
      const provider = new ethers.providers.JsonRpcProvider(
        network === 'mainnet'
          ? process.env.REACT_APP_MAINNET_RPC
          : process.env.REACT_APP_SEPOLIA_RPC,
        network === 'mainnet' ? 'mainnet' : 'sepolia'
      );

      // Create a new connected wallet instance with the current network
      const currentWallet = account.connect(provider);
      
      const currentBalance = await provider.getBalance(currentWallet.address);
      setDisplayBalance(Number(ethers.utils.formatEther(currentBalance)).toFixed(5));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setDisplayBalance('0.00000');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    updateBalance();
    
    // Set up an interval to update the balance every 30 seconds
    const interval = setInterval(updateBalance, 30000);
    return () => clearInterval(interval);
  }, [account, network]); // Add network as a dependency

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        if (account) {
          setNfts([]);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setNfts([]);
      }
    };

    fetchNFTs();
  }, [account, network]); // Add network as a dependency

  useEffect(() => {
    const fetchTokens = async () => {
      if (!account) return;
      
      setIsLoadingTokens(true);
      try {
        const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
        const baseUrl = network === 'mainnet' 
          ? 'https://api.etherscan.io/api'
          : 'https://api-sepolia.etherscan.io/api';

        // Use tokenbalance endpoint for better token detection
        const response = await fetch(
          `${baseUrl}?module=account&action=tokentx&address=${account.address}&apikey=${apiKey}`
        );
        const data = await response.json();

        if (data.status === '1' && data.result) {
          // Create a unique set of token contracts
          const uniqueTokens = [...new Set(data.result.map(tx => tx.contractAddress))];
          
          // Get token details and balances
          const tokenDetails = await Promise.all(
            uniqueTokens.map(async (tokenAddress) => {
              try {
                const tokenContract = new ethers.Contract(
                  tokenAddress,
                  ERC20_ABI,
                  account.provider
                );
                
                const balance = await tokenContract.balanceOf(account.address);
                const decimals = await tokenContract.decimals();
                const symbol = await tokenContract.symbol();
                const formattedBalance = ethers.utils.formatUnits(balance, decimals);
                
                // Only return tokens with non-zero balance
                if (Number(formattedBalance) > 0) {
                  return {
                    address: tokenAddress,
                    symbol,
                    balance: Number(formattedBalance).toFixed(4),
                    name: symbol // Use symbol as name if name is not available
                  };
                }
                return null;
              } catch (error) {
                console.error(`Error fetching token details for ${tokenAddress}:`, error);
                return null;
              }
            })
          );

          setTokens(tokenDetails.filter(token => token !== null));
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokens();
  }, [account, network]);

  const sendTransaction = async () => {
    try {
      // Create a new provider based on the current network
      const provider = new ethers.providers.JsonRpcProvider(
        network === 'mainnet'
          ? process.env.REACT_APP_MAINNET_RPC
          : process.env.REACT_APP_SEPOLIA_RPC,
        network === 'mainnet' ? 'mainnet' : 'sepolia'
      );

      // Create a new connected wallet instance with the current network
      const currentWallet = account.connect(provider);

      const tx = await currentWallet.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      
      // Update balance after transaction
      await updateBalance();
      alert('Transaction successful!');
      setRecipient('');
      setAmount('');
    } catch (error) {
      alert('Transaction failed: ' + error.message);
    }
  };

  return (
    <div className="wallet-card">
      <div className="balance-section">
        <h2>Balance</h2>
        <div className="balance-display">
          {isUpdating ? (
            <LoadingSpinner />
          ) : (
            <p className="balance">{displayBalance} ETH</p>
          )}
        </div>
        <p className="network">{network === 'mainnet' ? 'Ethereum Mainnet' : 'Sepolia Testnet'}</p>
      </div>

      <div className="tokens-section">
        <h3>Tokens</h3>
        {isLoadingTokens ? (
          <div className="tokens-loading">
            <LoadingSpinner />
          </div>
        ) : tokens.length > 0 ? (
          <div className="tokens-list">
            {tokens.map((token) => (
              <div key={token.address} className="token-item">
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
                <span className="token-balance">{token.balance}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-tokens">No tokens found</p>
        )}
      </div>

      <div className="transfer-section">
        <h3>Send ETH</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.00001"
        />
        <button onClick={sendTransaction}>Send</button>
      </div>

      <div className="nft-section">
        <h3>NFTs</h3>
        <div className="nft-grid">
          {nfts && nfts.length > 0 ? (
            nfts.map((nft) => (
              <div key={nft.id} className="nft-item">
                <img src={nft.image_url} alt={nft.name} />
                <p>{nft.name}</p>
              </div>
            ))
          ) : (
            <p className="no-nfts">No NFTs found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletCard; 