import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Navbar from './components/Navbar';
import WalletCard from './components/WalletCard';
import TransactionHistory from './components/TransactionHistory';
import DAOInterface from './components/DAOInterface';
import OnboardingSteps from './components/OnboardingSteps';
import ChatGPT from './components/ChatGPT';

function App() {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('mainnet');
  const [balance, setBalance] = useState(0);
  const [view, setView] = useState('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showWalletTutorial, setShowWalletTutorial] = useState(false);

  const onboardingSteps = [
    {
      title: "Welcome to Crypto Wallet",
      content: "Let's help you understand the basics of cryptocurrency wallets and how to use them safely.",
      buttonText: "Next"
    },
    {
      title: "What is a Crypto Wallet?",
      content: "A crypto wallet is like your personal bank account for cryptocurrencies. It lets you store, send, and receive digital assets securely.",
      buttonText: "Next"
    },
    {
      title: "Seed Phrase Importance",
      content: "Your seed phrase is like the master key to your wallet. Never share it with anyone and keep it stored safely offline.",
      buttonText: "Next"
    },
    {
      title: "Ready to Start?",
      content: "You can either create a new wallet or import an existing one using your seed phrase.",
      buttonText: "Get Started"
    }
  ];

  const provider = new ethers.providers.JsonRpcProvider(
    network === 'mainnet' 
      ? process.env.REACT_APP_MAINNET_RPC 
      : process.env.REACT_APP_SEPOLIA_RPC,
    network === 'mainnet' ? 'mainnet' : 'sepolia'
  );

  useEffect(() => {
    // Clear effect to prevent automatic loading
    localStorage.removeItem('wallet');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log('Current view:', view);
  }, [view]);

  useEffect(() => {
    const updateWalletForNetwork = async () => {
      if (account) {
        const provider = new ethers.providers.JsonRpcProvider(
          network === 'mainnet' 
            ? process.env.REACT_APP_MAINNET_RPC 
            : process.env.REACT_APP_SEPOLIA_RPC,
          network === 'mainnet' ? 'mainnet' : 'sepolia'
        );
        
        const wallet = account.connect(provider);
        setAccount(wallet);
        
        const balance = await provider.getBalance(wallet.address);
        setBalance(Number(ethers.utils.formatEther(balance)).toFixed(5));
      }
    };

    updateWalletForNetwork();
  }, [network]);

  const loadWallet = async (walletData) => {
    try {
      const wallet = new ethers.Wallet(walletData.privateKey, provider);
      setAccount(wallet);
      const balance = await provider.getBalance(wallet.address);
      setBalance(Number(ethers.utils.formatEther(balance)).toFixed(5));
      setView('wallet');
    } catch (error) {
      console.error('Error loading wallet:', error);
      alert('Failed to load wallet');
      localStorage.removeItem('wallet');
      setView('welcome');
    }
  };

  const createWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
      };
      const connectedWallet = wallet.connect(provider);
      setAccount(connectedWallet);
      setSeedPhrase(wallet.mnemonic.phrase);
      setView('seed-phrase');
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet');
    }
  };

  const confirmSeedPhrase = () => {
    const walletData = {
      address: account.address,
      privateKey: account.privateKey,
      mnemonic: seedPhrase
    };
    localStorage.setItem('wallet', JSON.stringify(walletData));
    setSeedPhrase(null);
    setView('wallet');
  };

  const importWallet = (seedPhrase) => {
    try {
      if (!seedPhrase || seedPhrase.trim() === '') {
        throw new Error('Seed phrase is required');
      }

      // Validate seed phrase format (12 or 24 words)
      const words = seedPhrase.trim().split(' ');
      if (words.length !== 12 && words.length !== 24) {
        throw new Error('Seed phrase must be 12 or 24 words');
      }

      // Create wallet from mnemonic
      const wallet = ethers.Wallet.fromMnemonic(seedPhrase.trim());
      const connectedWallet = wallet.connect(provider);
      
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: seedPhrase
      };
      
      localStorage.setItem('wallet', JSON.stringify(walletData));
      setAccount(connectedWallet);
      setView('wallet');
    } catch (error) {
      console.error('Invalid seed phrase:', error);
      alert('Invalid seed phrase. Please check and try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('wallet');
    setAccount(null);
    setBalance(0);
    setView('welcome');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (view === 'onboarding') {
      return (
        <OnboardingSteps 
          onComplete={() => {
            setShowWalletTutorial(false);
            setView('welcome');
          }} 
        />
      );
    }

    if (view === 'import') {
      return (
        <div className="import-screen">
          <h2>Import Wallet</h2>
          <p className="import-instruction">
            Enter your 12 or 24-word seed phrase to recover your wallet
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const seedPhrase = e.target.seedPhrase.value;
            importWallet(seedPhrase);
          }}>
            <textarea
              name="seedPhrase"
              placeholder="Enter your seed phrase (each word separated by a space)"
              required
              className="seed-phrase-input"
              rows="4"
            />
            <div className="import-actions">
              <button type="submit">Import Wallet</button>
              <button 
                type="button"
                onClick={() => setView('welcome')}
                className="secondary-button"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (view === 'seed-phrase' && seedPhrase) {
      return (
        <div className="seed-phrase-screen">
          <h2>Save Your Seed Phrase</h2>
          <p className="warning">
            Write down these 12 words in a secure location. You'll need them to recover your wallet.
          </p>
          <div className="seed-phrase-container">
            {seedPhrase.split(' ').map((word, index) => (
              <div key={index} className="seed-word">
                <span className="word-number">{index + 1}.</span>
                <span className="word">{word}</span>
              </div>
            ))}
          </div>
          <div className="seed-phrase-actions">
            <p className="confirmation-text">
              I have safely stored my seed phrase
            </p>
            <button onClick={confirmSeedPhrase}>Continue to Wallet</button>
            <button 
              onClick={() => {
                setAccount(null);
                setSeedPhrase(null);
                setView('welcome');
              }}
              className="secondary-button"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (!account || view === 'welcome') {
      return (
        <div className="welcome-screen">
          <h1>Welcome to Crypto Wallet</h1>
          <div className="welcome-buttons">
            <button onClick={createWallet}>Create New Wallet</button>
            <button onClick={() => setView('import')}>Import Existing Wallet</button>
            <button 
              onClick={() => setView('onboarding')} 
              className="onboarding-btn"
            >
              New to cryptocurrency wallets? Here are some fundamentals
            </button>
          </div>

          {/* Onboarding Modal */}
          {showOnboarding && (
            <div className="onboarding-overlay">
              <div className="onboarding-modal">
                <h2>{onboardingSteps[onboardingStep].title}</h2>
                <p>{onboardingSteps[onboardingStep].content}</p>
                <div className="onboarding-actions">
                  <button 
                    onClick={() => setShowOnboarding(false)} 
                    className="secondary-button"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={() => {
                      if (onboardingStep === onboardingSteps.length - 1) {
                        setShowOnboarding(false);
                        setOnboardingStep(0);
                      } else {
                        setOnboardingStep(prev => prev + 1);
                      }
                    }}
                    className="primary-button"
                  >
                    {onboardingSteps[onboardingStep].buttonText}
                  </button>
                </div>
                <div className="onboarding-progress">
                  {onboardingSteps.map((_, index) => (
                    <div 
                      key={index} 
                      className={`progress-dot ${index === onboardingStep ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (view) {
      case 'wallet':
        return (
          <>
            {showWalletTutorial ? (
              <OnboardingSteps onComplete={() => setShowWalletTutorial(false)} />
            ) : (
              <WalletCard 
                account={account}
                balance={balance}
                network={network}
              />
            )}
          </>
        );
      case 'transactions':
        return (
          <TransactionHistory 
            account={account}
            network={network}
          />
        );
      case 'dao':
        return (
          <DAOInterface 
            account={account}
            network={network}
          />
        );
      case 'chatgpt':
        return <ChatGPT />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Navbar 
        account={account} 
        network={network}
        setNetwork={setNetwork}
        setView={setView}
        onLogout={logout}
        view={view}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App; 