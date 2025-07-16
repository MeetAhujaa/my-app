import React, { useEffect, useState } from 'react';

function Sidebar() {
  const [accountInfo, setAccountInfo] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use static demo data for frontend-only display
    setAccountInfo({
      email: 'user@example.com',
      balances: [
        { asset: 'BTC', free: '0.005', locked: '0.000' },
        { asset: 'USDT', free: '1500.00', locked: '0.00' }
      ],
      accountType: 'SPOT',
      canTrade: true,
      updateTime: new Date().toLocaleString()
    });
    setTrades([
      { symbol: 'BTCUSDT', price: '69000', qty: '0.001', time: new Date().toLocaleString() },
      { symbol: 'ETHUSDT', price: '3500', qty: '0.05', time: new Date(Date.now() - 3600000).toLocaleString() }
    ]);
    setLoading(false);
  }, []);

  return (
    <div style={{
      width: '260px', background: '#181818', color: '#fff', padding: '1rem', borderRadius: '8px', minHeight: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginRight: '2rem'
    }}>
      <h2 style={{fontSize: '1.2rem', marginTop: 0}}>Account Info</h2>
      {loading ? <div>Loading...</div> : (
        <div>
          <div style={{fontSize: '0.95rem', marginBottom: '0.5rem'}}><strong>Email:</strong> {accountInfo.email}</div>
          <div style={{fontSize: '0.95rem', marginBottom: '0.5rem'}}><strong>Account Type:</strong> {accountInfo.accountType}</div>
          <div style={{fontSize: '0.95rem', marginBottom: '0.5rem'}}><strong>Can Trade:</strong> {accountInfo.canTrade ? 'Yes' : 'No'}</div>
          <div style={{fontSize: '0.95rem', marginBottom: '0.5rem'}}><strong>Last Update:</strong> {accountInfo.updateTime}</div>
          <div style={{marginTop: '0.5rem'}}>
            <strong>Balances:</strong>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {accountInfo.balances.map((bal, idx) => (
                <li key={idx} style={{fontSize: '0.95rem'}}>
                  {bal.asset}: {bal.free} (locked: {bal.locked})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <h2 style={{fontSize: '1.2rem', marginTop: '2rem'}}>Recent Trades</h2>
      {loading ? <div>Loading...</div> : (
        <ul style={{listStyle: 'none', padding: 0}}>
          {trades.map((trade, idx) => (
            <li key={idx} style={{marginBottom: '0.5rem'}}>
              <strong>{trade.symbol}</strong> @ {trade.price} (qty: {trade.qty})<br/>
              <span style={{fontSize: '0.85rem', color: '#aaa'}}>{trade.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Sidebar; 