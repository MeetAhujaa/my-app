import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [newCoin, setNewCoin] = useState({ symbol: '', amount: '', price: '' });
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const savedPortfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    setPortfolio(savedPortfolio);
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (coin) => {
          try {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/price`, {
              params: { symbol: `${coin.symbol}USDT` }
            });
            const currentPrice = parseFloat(response.data.price);
            return {
              ...coin,
              currentPrice,
              value: coin.amount * currentPrice,
              profitLoss: (currentPrice - coin.price) * coin.amount
            };
          } catch (error) {
            console.error(`Error fetching price for ${coin.symbol}:`, error);
            return coin;
          }
        })
      );

      setPortfolio(updatedPortfolio);
      const total = updatedPortfolio.reduce((sum, coin) => sum + coin.value, 0);
      setTotalValue(total);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const handleAddCoin = (e) => {
    e.preventDefault();
    const newCoinData = {
      ...newCoin,
      amount: parseFloat(newCoin.amount),
      price: parseFloat(newCoin.price)
    };
    const updatedPortfolio = [...portfolio, newCoinData];
    setPortfolio(updatedPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
    setNewCoin({ symbol: '', amount: '', price: '' });
  };

  return (
    <div className="portfolio">
      <h1>My Portfolio</h1>
      <div className="portfolio-summary">
        <h2>Total Value: ${totalValue.toLocaleString()}</h2>
      </div>
      
      <form onSubmit={handleAddCoin} className="add-coin-form">
        <input
          type="text"
          placeholder="Symbol (e.g., BTC)"
          value={newCoin.symbol}
          onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value.toUpperCase() })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={newCoin.amount}
          onChange={(e) => setNewCoin({ ...newCoin, amount: e.target.value })}
        />
        <input
          type="number"
          placeholder="Purchase Price"
          value={newCoin.price}
          onChange={(e) => setNewCoin({ ...newCoin, price: e.target.value })}
        />
        <button type="submit">Add Coin</button>
      </form>

      <div className="portfolio-table">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Amount</th>
              <th>Purchase Price</th>
              <th>Current Price</th>
              <th>Value</th>
              <th>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((coin, index) => (
              <tr key={index}>
                <td>{coin.symbol}</td>
                <td>{coin.amount}</td>
                <td>${coin.price.toLocaleString()}</td>
                <td>${coin.currentPrice?.toLocaleString()}</td>
                <td>${coin.value?.toLocaleString()}</td>
                <td className={coin.profitLoss >= 0 ? 'positive' : 'negative'}>
                  ${coin.profitLoss?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Portfolio; 