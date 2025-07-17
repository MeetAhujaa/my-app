"use client"

import { useState, useEffect } from "react"

function Dashboard({ coins, loading, onCoinClick, watchlist, addToWatchlist, removeFromWatchlist }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [marketData, setMarketData] = useState(null)

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/global")
      const data = await response.json()
      setMarketData(data.data)
    } catch (error) {
      console.error("Error fetching market data:", error)
    }
  }

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cryptocurrency data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {marketData && (
        <div className="market-overview">
          <h2>Global Market Overview</h2>
          <div className="market-stats">
            <div className="stat-card">
              <h3>Total Market Cap</h3>
              <p>${formatNumber(marketData.total_market_cap.usd)}</p>
            </div>
            <div className="stat-card">
              <h3>24h Volume</h3>
              <p>${formatNumber(marketData.total_volume.usd)}</p>
            </div>
            <div className="stat-card">
              <h3>Bitcoin Dominance</h3>
              <p>{marketData.market_cap_percentage.btc.toFixed(1)}%</p>
            </div>
            <div className="stat-card">
              <h3>Active Cryptocurrencies</h3>
              <p>{marketData.active_cryptocurrencies.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="coins-section">
        <div className="section-header">
          <h2>Top 100 Cryptocurrencies</h2>
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="coins-table">
          <div className="table-header">
            <div className="header-cell rank">#</div>
            <div className="header-cell name">Name</div>
            <div className="header-cell price">Price</div>
            <div className="header-cell change">24h Change</div>
            <div className="header-cell market-cap">Market Cap</div>
            <div className="header-cell volume">Volume (24h)</div>
            <div className="header-cell actions">Actions</div>
          </div>

          {filteredCoins.map((coin) => (
            <div key={coin.id} className="table-row">
              <div className="cell rank">{coin.market_cap_rank}</div>
              <div className="cell name" onClick={() => onCoinClick(coin)}>
                <img src={coin.image || "/placeholder.svg?height=32&width=32"} alt={coin.name} className="coin-image" />
                <div>
                  <div className="coin-name">{coin.name}</div>
                  <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                </div>
              </div>
              <div className="cell price">${coin.current_price.toFixed(2)}</div>
              <div className={`cell change ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </div>
              <div className="cell market-cap">${formatNumber(coin.market_cap)}</div>
              <div className="cell volume">${formatNumber(coin.total_volume)}</div>
              <div className="cell actions">
                <button
                  className={`watchlist-btn ${watchlist.includes(coin.id) ? "active" : ""}`}
                  onClick={() => {
                    if (watchlist.includes(coin.id)) {
                      removeFromWatchlist(coin.id)
                    } else {
                      addToWatchlist(coin)
                    }
                  }}
                >
                  {watchlist.includes(coin.id) ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
