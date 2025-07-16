import React from 'react';

function CryptoCard({ crypto, onClick }) {
  // This component is no longer used in the main dashboard, but is kept clean and error-free.
  const priceChangeClass = crypto.change24h >= 0 ? 'positive' : 'negative';

  return (
    <div className="crypto-card" onClick={onClick}>
      <h3>{crypto.symbol}</h3>
      <div className="price">${crypto.price.toLocaleString()}</div>
      <div className={`change ${priceChangeClass}`}>
        {crypto.change24h >= 0 ? '↑' : '↓'} {Math.abs(crypto.change24h).toFixed(2)}%
      </div>
      <div className="volume">
        24h Volume: ${crypto.volume.toLocaleString()}
      </div>
    </div>
  );
}

export default CryptoCard; 