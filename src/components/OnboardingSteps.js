import React from 'react';
import './OnboardingSteps.css';

function OnboardingSteps({ onComplete }) {
  const [currentStep, setCurrentStep] = React.useState('menu');
  
  const topics = {
    blockchain: {
      title: "What is a Blockchain?",
      content: [
        "A blockchain is a digital ledger that records transactions across a network of computers:",
        "• Decentralized and transparent",
        "• Immutable record of transactions",
        "• Secured by cryptography",
        "• No single point of control"
      ]
    },
    transaction: {
      title: "What is a transaction?",
      content: [
        "A cryptocurrency transaction is a transfer of value on the blockchain:",
        "• Digital transfer of assets",
        "• Recorded permanently",
        "• Verified by network participants",
        "• Requires a small fee (gas)"
      ]
    },
    assets: {
      title: "What are crypto assets?",
      content: [
        "Crypto assets are digital tokens with various uses:",
        "• Cryptocurrencies for payments",
        "• Utility tokens for services",
        "• Governance tokens for voting",
        "• NFTs for digital ownership"
      ]
    },
    wallet: {
      title: "What can a cryptocurrency wallet do?",
      content: [
        "A cryptocurrency wallet is your gateway to blockchain:",
        "• Store and manage crypto assets",
        "• Send and receive transactions",
        "• Connect to blockchain applications",
        "• Sign messages and transactions"
      ]
    },
    remember: {
      title: "Please, remember!",
      content: [
        "Critical points for using crypto safely:",
        "• Never share your private keys",
        "• Backup your seed phrase offline",
        "• Verify all transaction details",
        "• Be cautious of scams and phishing"
      ]
    }
  };

  const renderMainMenu = () => (
    <div className="onboarding-menu">
      <h2>Onboarding</h2>
      <div className="topic-buttons">
        <button onClick={() => setCurrentStep('blockchain')}>
          What is a Blockchain?
        </button>
        <button onClick={() => setCurrentStep('transaction')}>
          What is a transaction?
        </button>
        <button onClick={() => setCurrentStep('assets')}>
          What are crypto assets?
        </button>
        <button onClick={() => setCurrentStep('wallet')}>
          What can a cryptocurrency wallet do?
        </button>
        <button onClick={() => setCurrentStep('remember')}>
          Please, remember!
        </button>
      </div>
      <button 
        onClick={onComplete} 
        className="back-button"
      >
        ← Back
      </button>
    </div>
  );

  const renderTopic = (topic) => (
    <div className="topic-content">
      <h2>{topics[topic].title}</h2>
      <div className="step-content">
        {topics[topic].content.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div className="topic-navigation">
        <button 
          onClick={() => setCurrentStep('menu')} 
          className="secondary-button"
        >
          Back to Topics
        </button>
        <button 
          onClick={onComplete}
          className="primary-button"
        >
          Finish
        </button>
      </div>
    </div>
  );

  return (
    <div className="onboarding-steps">
      <div className="onboarding-content">
        {currentStep === 'menu' 
          ? renderMainMenu() 
          : renderTopic(currentStep)
        }
      </div>
    </div>
  );
}

export default OnboardingSteps; 