import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoCard from './CryptoCard';
import PriceChart from './PriceChart';

function Home() {
  // BTC/USDT price state
  const [btcPrice, setBtcPrice] = useState(null);
  const [btcLoading, setBtcLoading] = useState(true);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  // Global market overview state
  const [marketOverview, setMarketOverview] = useState({ marketCap: null, volume: null, btcDominance: null, loading: true });
  const [watchlist, setWatchlist] = useState([]);

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

  useEffect(() => {
    // Fetch global market overview (simulate with top 100 USDT pairs)
    const fetchMarketOverview = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        const usdtPairs = data.filter(crypto => crypto.symbol.endsWith('USDT')).slice(0, 100);
        let totalMarketCap = 0;
        let totalVolume = 0;
        let btcMarketCap = 0;
        usdtPairs.forEach(crypto => {
          const price = parseFloat(crypto.lastPrice);
          const volume = parseFloat(crypto.volume);
          const marketCap = price * volume;
          totalMarketCap += marketCap;
          totalVolume += parseFloat(crypto.quoteVolume);
          if (crypto.symbol === 'BTCUSDT') btcMarketCap = marketCap;
        });
        setMarketOverview({
          marketCap: totalMarketCap,
          volume: totalVolume,
          btcDominance: btcMarketCap / totalMarketCap * 100,
          loading: false
        });
      } catch (e) {
        setMarketOverview({ marketCap: null, volume: null, btcDominance: null, loading: false });
      }
    };
    fetchMarketOverview();
    const interval = setInterval(fetchMarketOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist watchlist to localStorage
  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) setWatchlist(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add to watchlist handler
  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
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
      {/* Global Market Overview */}
      <div className="market-overview" style={{
        background: '#181818', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '2rem', maxWidth: '700px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {marketOverview.loading ? (
          <span>Loading market overview...</span>
        ) : (
          <>
            <div><strong>Total Market Cap:</strong><br/>${marketOverview.marketCap ? marketOverview.marketCap.toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}</div>
            <div><strong>24h Volume:</strong><br/>${marketOverview.volume ? marketOverview.volume.toLocaleString(undefined, {maximumFractionDigits: 0}) : '-'}</div>
            <div><strong>BTC Dominance:</strong><br/>{marketOverview.btcDominance ? marketOverview.btcDominance.toFixed(2) + '%' : '-'}</div>
          </>
        )}
      </div>
      <h1>Cryptocurrency Market</h1>
      {/* Crypto Table */}
      <table style={{ width: '100%', background: '#181818', color: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '2rem', borderCollapse: 'collapse', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#222' }}>
            <th style={{ padding: '0.75rem' }}>#</th>
            <th style={{ padding: '0.75rem' }}>Symbol</th>
            <th style={{ padding: '0.75rem' }}>Price</th>
            <th style={{ padding: '0.75rem' }}>24h Change</th>
            <th style={{ padding: '0.75rem' }}>24h Volume</th>
            <th style={{ padding: '0.75rem' }}>Watchlist</th>
          </tr>
        </thead>
        <tbody>
          {cryptoData.map((crypto, idx) => (
            <tr key={crypto.symbol} style={{ borderBottom: '1px solid #333', cursor: 'pointer' }} onClick={() => setSelectedCrypto(crypto.symbol)}>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{crypto.symbol}</td>
              <td style={{ padding: '0.75rem' }}>${crypto.price.toLocaleString()}</td>
              <td style={{ padding: '0.75rem', color: crypto.change24h >= 0 ? '#4caf50' : '#f44336' }}>{crypto.change24h >= 0 ? '↑' : '↓'} {Math.abs(crypto.change24h).toFixed(2)}%</td>
              <td style={{ padding: '0.75rem' }}>${crypto.volume.toLocaleString()}</td>
              <td style={{ padding: '0.75rem' }}>
                <button
                  style={{
                    background: watchlist.includes(crypto.symbol) ? '#4caf50' : '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.4rem 0.8rem',
                    cursor: 'pointer'
                  }}
                  onClick={e => { e.stopPropagation(); addToWatchlist(crypto.symbol); }}
                  disabled={watchlist.includes(crypto.symbol)}
                >
                  {watchlist.includes(crypto.symbol) ? 'Added' : 'Add'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Watchlist Section */}
      {watchlist.length > 0 && (
        <div className="watchlist-section" style={{
          background: '#181818', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '700px'
        }}>
          <h2 style={{marginTop: 0}}>Watchlist</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#222' }}>
                <th style={{ padding: '0.5rem' }}>Symbol</th>
                <th style={{ padding: '0.5rem' }}>Price</th>
                <th style={{ padding: '0.5rem' }}>24h Change</th>
                <th style={{ padding: '0.5rem' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(symbol => {
                const coin = cryptoData.find(c => c.symbol === symbol);
                if (!coin) return null;
                return (
                  <tr key={symbol} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{coin.symbol}</td>
                    <td style={{ padding: '0.5rem' }}>${coin.price.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem', color: coin.change24h >= 0 ? '#4caf50' : '#f44336' }}>{coin.change24h >= 0 ? '↑' : '↓'} {Math.abs(coin.change24h).toFixed(2)}%</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button
                        style={{
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.3rem 0.7rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => removeFromWatchlist(symbol)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="chart-container">
        <h2>{selectedCrypto} Price Chart</h2>
        <PriceChart symbol={selectedCrypto} />
      </div>
    </div>
  );
}

export default Home; 