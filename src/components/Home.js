import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';

function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const filteredData = response.data
          .filter(crypto => crypto.symbol.endsWith('USDT'))
          .slice(0, 10)
          .map(crypto => ({
            symbol: crypto.symbol.replace('USDT', ''),
            price: parseFloat(crypto.lastPrice),
            change24h: parseFloat(crypto.priceChangePercent),
            volume: parseFloat(crypto.volume),
            high24h: parseFloat(crypto.highPrice),
            low24h: parseFloat(crypto.lowPrice)
          }));
        setCryptoData(filteredData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <h1>Cryptocurrency Market</h1>
      <div className="crypto-grid">
        {cryptoData.map(crypto => (
          <CryptoCard
            key={crypto.symbol}
            crypto={crypto}
            onClick={() => setSelectedCrypto(crypto.symbol)}
          />
        ))}
      </div>
      <div className="chart-container">
        <h2>{selectedCrypto} Price Chart</h2>
        <PriceChart symbol={selectedCrypto} />
      </div>
    </div>
  );
}

export default Home; 