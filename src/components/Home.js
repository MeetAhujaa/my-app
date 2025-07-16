import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';
import Sidebar from './Sidebar';

function Home() {
  // BTC/USDT price state
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcLoading, setBtcLoading] = useState(true);
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

  useEffect(() => {
    // Fetch BTC/USDT price
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        setBtcPrice(parseFloat(data.price));
        setBtcLoading(false);
      } catch (error) {
        setBtcLoading(false);
      }
    };
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <Sidebar />
      <div className="home" style={{ flex: 1 }}>
        {/* BTC/USDT Price Card */}
        <div className="btc-card" style={{
          background: '#222', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', maxWidth: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{margin: 0}}>BTC/USDT</h2>
          {btcLoading ? (
            <span>Loading...</span>
          ) : (
            <span style={{fontSize: '2rem', fontWeight: 'bold'}}>${btcPrice?.toLocaleString()}</span>
          )}
        </div>
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
    </div>
  );
}

export default Home; 