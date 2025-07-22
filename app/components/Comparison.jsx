"use client"

import { useState } from "react"
import { formatNumber } from "../../lib/utils.js"

export default function Comparison({ coins }) {
  const [selectedCoins, setSelectedCoins] = useState([])
  const [timeframe, setTimeframe] = useState("7")
  const [loading, setLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(null)
  const validatedCoins = Array.isArray(coins) ? coins : []
  const addCoin = (coinId) => {
    if (!selectedCoins.includes(coinId) && selectedCoins.length < 5) {
      setSelectedCoins([...selectedCoins, coinId])
    }
  }
  const removeCoin = (coinId) => {
    setSelectedCoins(selectedCoins.filter((id) => id !== coinId))
  }
  return (
    <div className="comparison">
      <h2>Cryptocurrency Comparison</h2>
      {rateLimitError && (
        <div className="error-message">
          <p>{rateLimitError}</p>
          <p>Please try again in a few moments.</p>
        </div>
      )}
      <div className="comparison-controls">
        <div className="coin-selector">
          <h3>Select Coins to Compare (Max 5)</h3>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addCoin(e.target.value)
                e.target.value = ""
              }
            }}
            className="coin-select"
          >
            <option value="">Choose a cryptocurrency...</option>
            {validatedCoins.slice(0, 50).map((coin) => (
              <option key={coin.id} value={coin.id} disabled={selectedCoins.includes(coin.id)}>
                {coin.name} ({coin.symbol?.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        <div className="timeframe-selector">
          <h3>Timeframe (for reference)</h3>
          <div className="timeframe-buttons">
            {["1", "7", "30", "90", "365"].map((days) => (
              <button
                key={days}
                className={`timeframe-btn ${timeframe === days ? "active" : ""}`}
                onClick={() => setTimeframe(days)}
              >
                {days === "1" ? "1D" : days === "7" ? "1W" : days === "30" ? "1M" : days === "90" ? "3M" : "1Y"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="selected-coins">
        {selectedCoins.map((coinId) => {
          const coin = validatedCoins.find((c) => c.id === coinId)
          return coin ? (
            <div key={coinId} className="selected-coin">
              <img src={coin.image || "/placeholder.svg?height=32&width=32"} alt={coin.name} className="coin-image" />
              <span className="coin-name">{coin.name}</span>
              <button onClick={() => removeCoin(coinId)} className="remove-coin-btn">
                7
              </button>
            </div>
          ) : null
        })}
      </div>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading comparison data...</p>
        </div>
      )}
      {selectedCoins.length > 0 && (
        <div className="comparison-table">
          <h3>Current Statistics</h3>
          <div className="stats-table">
            <div className="table-header">
              <div className="header-cell">Coin</div>
              <div className="header-cell">Price</div>
              <div className="header-cell">24h Change</div>
              <div className="header-cell">Market Cap</div>
              <div className="header-cell">Volume</div>
            </div>
            {selectedCoins.map((coinId) => {
              const coin = validatedCoins.find((c) => c.id === coinId)
              return coin ? (
                <div key={coinId} className="table-row">
                  <div className="cell">
                    <img
                      src={coin.image || "/placeholder.svg?height=32&width=32"}
                      alt={coin.name}
                      className="coin-image"
                    />
                    <span>{coin.symbol?.toUpperCase()}</span>
                  </div>
                  <div className="cell">${coin.current_price?.toFixed(2)}</div>
                  <div className={`cell ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}>
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                  <div className="cell">${formatNumber(coin.market_cap)}</div>
                  <div className="cell">${formatNumber(coin.total_volume)}</div>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
