"use client"

import { useState, useEffect } from "react"

const API_KEY = "HZTpvYhBm3hm7utTkkaK1V6t44QoFwVLGt9NqF0jX1PPMV4gC6ijfNMRDEtyU3lY"

function CoinDetail({ coin, onBack, watchlist, addToWatchlist, removeFromWatchlist, addToPortfolio }) {
  const [coinData, setCoinData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [timeframe, setTimeframe] = useState("7")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coin) {
      fetchCoinDetail()
      fetchHistoricalData()
    }
  }, [coin, timeframe])

  const fetchCoinDetail = async () => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?x_cg_demo_api_key=${API_KEY}`)
      const data = await response.json()
      setCoinData(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching coin detail:", error)
      setLoading(false)
    }
  }

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${timeframe}&x_cg_demo_api_key=${API_KEY}`,
      )
      const data = await response.json()
      setHistoricalData(data.prices || [])
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const handleAddToPortfolio = () => {
    if (quantity && Number.parseFloat(quantity) > 0) {
      addToPortfolio(coin.id, Number.parseFloat(quantity))
      setQuantity("")
      alert("Added to portfolio!")
    }
  }

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  if (loading || !coinData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading coin details...</p>
      </div>
    )
  }

  return (
    <div className="coin-detail">
      <button className="back-btn" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <div className="coin-header">
        <img
          src={coinData.image?.large || "/placeholder.svg?height=80&width=80"}
          alt={coinData.name}
          className="coin-detail-image"
        />
        <div className="coin-info">
          <h1>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </h1>
          <div className="coin-price">
            <span className="current-price">${coinData.market_data.current_price.usd.toFixed(2)}</span>
            <span
              className={`price-change ${coinData.market_data.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}
            >
              {coinData.market_data.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="coin-actions">
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
            {watchlist.includes(coin.id) ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        </div>
      </div>

      <div className="coin-stats">
        <div className="stat-item">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">${formatNumber(coinData.market_data.market_cap.usd)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${formatNumber(coinData.market_data.total_volume.usd)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Circulating Supply</span>
          <span className="stat-value">{formatNumber(coinData.market_data.circulating_supply)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">All Time High</span>
          <span className="stat-value">${coinData.market_data.ath.usd.toFixed(2)}</span>
        </div>
      </div>

      <div className="portfolio-section">
        <h3>Add to Portfolio</h3>
        <div className="portfolio-input">
          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="quantity-input"
          />
          <button onClick={handleAddToPortfolio} className="add-portfolio-btn">
            Add to Portfolio
          </button>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3>Price Chart</h3>
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
        <div className="simple-chart">{historicalData.length > 0 && <SimpleChart data={historicalData} />}</div>
      </div>

      {coinData.description?.en && (
        <div className="coin-description">
          <h3>About {coinData.name}</h3>
          <p dangerouslySetInnerHTML={{ __html: coinData.description.en.split(".")[0] + "." }}></p>
        </div>
      )}
    </div>
  )
}

function SimpleChart({ data }) {
  const maxPrice = Math.max(...data.map((point) => point[1]))
  const minPrice = Math.min(...data.map((point) => point[1]))
  const priceRange = maxPrice - minPrice

  return (
    <div className="chart-container">
      <svg width="100%" height="300" viewBox="0 0 800 300">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {data.map((point, index) => {
          if (index === 0) return null

          const x1 = (index - 1) * (800 / (data.length - 1))
          const y1 = 280 - ((data[index - 1][1] - minPrice) / priceRange) * 260
          const x2 = index * (800 / (data.length - 1))
          const y2 = 280 - ((point[1] - minPrice) / priceRange) * 260

          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4CAF50" strokeWidth="2" />
        })}

        <text x="10" y="20" fill="#666" fontSize="12">
          ${maxPrice.toFixed(2)}
        </text>
        <text x="10" y="290" fill="#666" fontSize="12">
          ${minPrice.toFixed(2)}
        </text>
      </svg>
    </div>
  )
}

export default CoinDetail
