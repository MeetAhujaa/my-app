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
  const [portfolio, setPortfolio] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ symbol: '', amount: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [compareCoins, setCompareCoins] = useState(['BTCUSDT', 'ETHUSDT']);
  const [compareData, setCompareData] = useState({});
  const [compareLoading, setCompareLoading] = useState(false);
  const [detailsCoin, setDetailsCoin] = useState(null);
  const [detailsHistory, setDetailsHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  // Portfolio localStorage
  useEffect(() => {
    const stored = localStorage.getItem('portfolio');
    if (stored) setPortfolio(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Add to watchlist handler
  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const openPortfolioForm = (symbol = '', amount = '', idx = null) => {
    setPortfolioForm({ symbol, amount });
    setEditIndex(idx);
    setShowPortfolioForm(true);
  };
  const closePortfolioForm = () => {
    setShowPortfolioForm(false);
    setPortfolioForm({ symbol: '', amount: '' });
    setEditIndex(null);
  };
  const handlePortfolioFormChange = e => {
    setPortfolioForm({ ...portfolioForm, [e.target.name]: e.target.value });
  };
  const handlePortfolioFormSubmit = e => {
    e.preventDefault();
    const symbol = portfolioForm.symbol.trim().toUpperCase();
    const amount = parseFloat(portfolioForm.amount);
    if (!symbol || isNaN(amount) || amount <= 0) return;
    if (editIndex !== null) {
      // Edit
      const updated = [...portfolio];
      updated[editIndex] = { symbol, amount };
      setPortfolio(updated);
    } else {
      // Add
      if (portfolio.some(p => p.symbol === symbol)) return;
      setPortfolio([...portfolio, { symbol, amount }]);
    }
    closePortfolioForm();
  };
  const removeFromPortfolio = idx => {
    setPortfolio(portfolio.filter((_, i) => i !== idx));
  };
  // Calculate total value
  const getCoinPrice = symbol => {
    const coin = cryptoData.find(c => c.symbol === symbol);
    return coin ? coin.price : 0;
  };
  const totalValue = portfolio.reduce((sum, p) => sum + getCoinPrice(p.symbol) * p.amount, 0);

  // Fetch historical data for selected coins
  useEffect(() => {
    const fetchHistory = async (symbol) => {
      // Binance API: /api/v3/klines?symbol=BTCUSDT&interval=1d&limit=7
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=7`);
      const data = await res.json();
      // Return array of { time, close }
      return data.map(d => ({ time: d[0], close: parseFloat(d[4]) }));
    };
    const load = async () => {
      setCompareLoading(true);
      const out = {};
      for (const symbol of compareCoins) {
        out[symbol] = await fetchHistory(symbol);
      }
      setCompareData(out);
      setCompareLoading(false);
    };
    if (compareCoins.length > 0) load();
  }, [compareCoins]);

  const handleCompareChange = (idx, value) => {
    const updated = [...compareCoins];
    updated[idx] = value;
    setCompareCoins(updated.filter((v, i, arr) => v && arr.indexOf(v) === i)); // unique, no empty
  };
  const addCompareCoin = () => {
    if (compareCoins.length < 3) setCompareCoins([...compareCoins, '']);
  };
  const removeCompareCoin = idx => {
    setCompareCoins(compareCoins.filter((_, i) => i !== idx));
  };

  // SVG Chart rendering
  const chartColors = ['#4caf50', '#2196f3', '#f44336'];
  const renderChart = () => {
    // Find max and min for scaling
    let all = [];
    Object.values(compareData).forEach(arr => { if (arr) all = all.concat(arr.map(d => d.close)); });
    if (!all.length) return null;
    const min = Math.min(...all);
    const max = Math.max(...all);
    const w = 400, h = 180, pad = 30;
    // X: 7 days, Y: price
    return (
      <svg width={w} height={h} style={{ background: '#222', borderRadius: '8px', width: '100%', maxWidth: w }}>
        {/* Y axis */}
        <text x={5} y={pad} fill="#fff" fontSize="12">{max.toFixed(2)}</text>
        <text x={5} y={h - 5} fill="#fff" fontSize="12">{min.toFixed(2)}</text>
        {/* Lines */}
        {Object.entries(compareData).map(([symbol, arr], i) => arr && arr.length === 7 && (
          <polyline
            key={symbol}
            fill="none"
            stroke={chartColors[i % chartColors.length]}
            strokeWidth="2"
            points={arr.map((d, j) => {
              const x = pad + j * ((w - 2 * pad) / 6);
              const y = pad + (h - 2 * pad) * (1 - (d.close - min) / (max - min || 1));
              return `${x},${y}`;
            }).join(' ')}
          />
        ))}
        {/* Legend */}
        {compareCoins.map((symbol, i) => symbol && (
          <g key={symbol}>
            <rect x={w - 110} y={10 + i * 22} width="16" height="16" fill={chartColors[i % chartColors.length]} />
            <text x={w - 90} y={23 + i * 22} fill="#fff" fontSize="13">{symbol.replace('USDT', '')}</text>
          </g>
        ))}
      </svg>
    );
  };

  // Fetch 30-day history for details modal
  useEffect(() => {
    if (!detailsCoin) return;
    const fetchHistory = async () => {
      setDetailsLoading(true);
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${detailsCoin.symbol}&interval=1d&limit=30`);
      const data = await res.json();
      setDetailsHistory(data.map(d => ({ time: d[0], close: parseFloat(d[4]) })));
      setDetailsLoading(false);
    };
    fetchHistory();
  }, [detailsCoin]);

  const openDetails = symbol => {
    const coin = cryptoData.find(c => c.symbol === symbol);
    if (coin) setDetailsCoin(coin);
  };
  const closeDetails = () => {
    setDetailsCoin(null);
    setDetailsHistory([]);
  };

  const renderDetailsChart = () => {
    if (!detailsHistory.length) return null;
    const w = 400, h = 180, pad = 30;
    const min = Math.min(...detailsHistory.map(d => d.close));
    const max = Math.max(...detailsHistory.map(d => d.close));
    return (
      <svg width={w} height={h} style={{ background: '#222', borderRadius: '8px', width: '100%', maxWidth: w }}>
        <text x={5} y={pad} fill="#fff" fontSize="12">{max.toFixed(2)}</text>
        <text x={5} y={h - 5} fill="#fff" fontSize="12">{min.toFixed(2)}</text>
        <polyline
          fill="none"
          stroke="#4caf50"
          strokeWidth="2"
          points={detailsHistory.map((d, j) => {
            const x = pad + j * ((w - 2 * pad) / (detailsHistory.length - 1));
            const y = pad + (h - 2 * pad) * (1 - (d.close - min) / (max - min || 1));
            return `${x},${y}`;
          }).join(' ')}
        />
      </svg>
    );
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
            <tr key={crypto.symbol} style={{ borderBottom: '1px solid #333', cursor: 'pointer' }} onClick={() => openDetails(crypto.symbol)}>
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
      {/* Portfolio Section */}
      <div className="portfolio-section" style={{
        background: '#181818', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '700px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{marginTop: 0}}>Portfolio</h2>
          <button
            style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => openPortfolioForm()}
          >
            Add Coin
          </button>
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Total Value: ${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})} USDT</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#222' }}>
              <th style={{ padding: '0.5rem' }}>Coin</th>
              <th style={{ padding: '0.5rem' }}>Amount</th>
              <th style={{ padding: '0.5rem' }}>Price</th>
              <th style={{ padding: '0.5rem' }}>Value</th>
              <th style={{ padding: '0.5rem' }}>Edit</th>
              <th style={{ padding: '0.5rem' }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((p, idx) => (
              <tr key={p.symbol} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{p.symbol}</td>
                <td style={{ padding: '0.5rem' }}>{p.amount}</td>
                <td style={{ padding: '0.5rem' }}>${getCoinPrice(p.symbol).toLocaleString()}</td>
                <td style={{ padding: '0.5rem' }}>${(getCoinPrice(p.symbol) * p.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button
                    style={{ background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}
                    onClick={() => openPortfolioForm(p.symbol, p.amount, idx)}
                  >
                    Edit
                  </button>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button
                    style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}
                    onClick={() => removeFromPortfolio(idx)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Portfolio Form Modal */}
        {showPortfolioForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <form
              onSubmit={handlePortfolioFormSubmit}
              style={{ background: '#222', color: '#fff', padding: '2rem', borderRadius: '8px', minWidth: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <h3 style={{margin: 0}}>{editIndex !== null ? 'Edit' : 'Add'} Coin</h3>
              <label>
                Symbol:
                <input
                  name="symbol"
                  value={portfolioForm.symbol}
                  onChange={handlePortfolioFormChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', marginTop: '0.3rem', marginBottom: '0.7rem' }}
                  placeholder="e.g. BTC"
                  required
                  disabled={editIndex !== null}
                />
              </label>
              <label>
                Amount:
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="any"
                  value={portfolioForm.amount}
                  onChange={handlePortfolioFormChange}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', marginTop: '0.3rem', marginBottom: '0.7rem' }}
                  placeholder="e.g. 0.5"
                  required
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={closePortfolioForm} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>{editIndex !== null ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Comparative Chart Section */}
      <div className="compare-section" style={{
        background: '#181818', color: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '700px'
      }}>
        <h2 style={{marginTop: 0}}>Comparative Chart (7 Days)</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {compareCoins.map((symbol, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={symbol}
                onChange={e => handleCompareChange(idx, e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
              >
                <option value="">Select Coin</option>
                {cryptoData.map(c => (
                  <option key={c.symbol} value={c.symbol}>{c.symbol.replace('USDT', '')}</option>
                ))}
              </select>
              {compareCoins.length > 1 && (
                <button onClick={() => removeCompareCoin(idx)} style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer' }}>×</button>
              )}
            </span>
          ))}
          {compareCoins.length < 3 && (
            <button onClick={addCompareCoin} style={{ background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Coin</button>
          )}
        </div>
        <div style={{ width: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {compareLoading ? <span>Loading chart...</span> : renderChart()}
        </div>
      </div>
      <div className="chart-container">
        <h2>{selectedCrypto} Price Chart</h2>
        <PriceChart symbol={selectedCrypto} />
      </div>
      {/* Coin Details Modal */}
      {detailsCoin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#181818', color: '#fff', borderRadius: '10px', padding: '2rem', minWidth: '320px', maxWidth: '90vw', boxShadow: '0 2px 16px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={closeDetails} style={{ position: 'absolute', top: 10, right: 10, background: '#f44336', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>×</button>
            <h2 style={{marginTop: 0}}>{detailsCoin.symbol.replace('USDT', '')} Details</h2>
            <div style={{ marginBottom: '0.5rem' }}><strong>Price:</strong> ${detailsCoin.price.toLocaleString()}</div>
            <div style={{ marginBottom: '0.5rem', color: detailsCoin.change24h >= 0 ? '#4caf50' : '#f44336' }}><strong>24h Change:</strong> {detailsCoin.change24h >= 0 ? '↑' : '↓'} {Math.abs(detailsCoin.change24h).toFixed(2)}%</div>
            <div style={{ marginBottom: '1rem' }}><strong>24h Volume:</strong> ${detailsCoin.volume.toLocaleString()}</div>
            <div style={{ marginBottom: '1rem' }}><strong>30-Day Price Chart:</strong></div>
            <div style={{ width: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {detailsLoading ? <span>Loading chart...</span> : renderDetailsChart()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home; 