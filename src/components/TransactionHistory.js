import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TransactionHistory.css';

function TransactionHistory({ account, network }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const apiKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
      const baseUrl = network === 'mainnet' 
        ? 'https://api.etherscan.io/api'
        : 'https://api-sepolia.etherscan.io/api';

      const response = await fetch(
        `${baseUrl}?module=account&action=txlist&address=${account.address}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      // Sort transactions by timestamp in descending order (newest first)
      const sortedTransactions = data.result
        ? data.result.sort((a, b) => b.timeStamp - a.timeStamp)
        : [];
      
      setTransactions(sortedTransactions);
    };

    if (account) {
      fetchTransactions();
    }
  }, [account, network]);

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      <div className="transaction-list">
        {transactions.map((tx) => (
          <div key={tx.hash} className="transaction-item">
            <div className="transaction-info">
              <div className="transaction-row">
                <span className="transaction-type">
                  {tx.from.toLowerCase() === account.address.toLowerCase() ? 'Sent' : 'Received'}
                </span>
                <span className="transaction-amount">
                  {Number(ethers.utils.formatEther(tx.value)).toFixed(5)} ETH
                </span>
                <span className="transaction-date">
                  {new Date(tx.timeStamp * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="transaction-row">
                <span className="transaction-address">
                  {tx.from.toLowerCase() === account.address.toLowerCase() ? 
                    `To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` :
                    `From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                  }
                </span>
                <a 
                  href={`${network === 'mainnet' ? 'https://etherscan.io' : 'https://sepolia.etherscan.io'}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transaction-link"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
            <div className="transaction-status">
              {tx.confirmations > 0 ? 'Completed' : 'Pending'}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="no-transactions">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory; 