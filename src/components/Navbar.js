import React from 'react';
import './Navbar.css';

function Navbar({ account, network, setNetwork, setView, onLogout, view }) {
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address);
      // Optional: Add a small visual feedback
      const addressElement = document.querySelector('.address');
      addressElement.dataset.tooltip = 'Copied!';
      setTimeout(() => {
        addressElement.dataset.tooltip = account.address;
      }, 1000);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="network-selector">
          <select 
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option value="mainnet">Ethereum Mainnet</option>
            <option value="sepolia">Sepolia Testnet</option>
          </select>
        </div>
        
        {account && (
          <div className="account-section">
            <div 
              className="address" 
              onClick={copyAddress}
              data-tooltip={account.address}
            >
              {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
            </div>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        )}
      </div>
      
      {account && (
        <div className="navbar-bottom">
          <div className="nav-links">
            <button 
              onClick={() => setView('wallet')} 
              className={view === 'wallet' ? 'active' : ''}
            >
              Wallet
            </button>
            <button 
              onClick={() => setView('transactions')} 
              className={view === 'transactions' ? 'active' : ''}
            >
              Transactions
            </button>
            <button 
              onClick={() => setView('dao')} 
              className={view === 'dao' ? 'active' : ''}
            >
              DAO
            </button>
            <button 
              onClick={() => setView('chatgpt')}
              className={view === 'chatgpt' ? 'active' : ''}
            >
              Ask AI
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 