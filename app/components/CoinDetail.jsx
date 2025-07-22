"use client"

import { useState, useEffect } from "react"
import { getCachedData, setCachedData, CACHE_DURATION_DETAIL_MS, CACHE_DURATION_HISTORY_MS } from "../../lib/cache.js"
import { formatNumber } from "../../lib/utils.js"

export default function CoinDetail({ coin, onBack, watchlist, addToWatchlist, removeFromWatchlist, addToPortfolio }) {
  const [coinData, setCoinData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [timeframe, setTimeframe] = useState("7")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(true)
  const [rateLimitError, setRateLimitError] = useState(null)

  const validatedWatchlist = Array.isArray(watchlist) ? watchlist : []

  useEffect(() => {
    if (coin) {
      fetchCoinDetail()
      const handler = setTimeout(() => {
        fetchHistoricalData()
      }, 300)
      return () => {
        clearTimeout(handler)
      }
    }
  }, [coin, timeframe])

  const fetchCoinDetail = async () => {
    if (!coin?.id) {
      setLoading(false)
      return
    }
    const cacheKey = `cached_coin_detail_${coin.id}`
    const cachedDetail = getCachedData(cacheKey, CACHE_DURATION_DETAIL_MS)

    if (cachedDetail) {
      setCoinData(cachedDetail)
      setLoading(false)
      return
    }

    try {
      setRateLimitError(null)
      const response = await fetch(`/api/coin-detail/${coin.id}`)
      const data = await response.json()

      if (!response.ok) {
        const errorText = await response.text()
        let errorData = { error: "Unknown error" }
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData.error = errorText
        }
        if (response.status === 429) {
          setRateLimitError("Rate limit exceeded. Please wait a moment before trying again.")
        }
        throw new Error(errorData.error || `Failed to fetch coin detail: ${response.statusText}`)
      }

      setCoinData(data)
      setCachedData(cacheKey, data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching coin detail:", error)
      if (!rateLimitError) {
        setRateLimitError(error.message)
      }
      setLoading(false)
    }
  }

  const fetchHistoricalData = async () => {
    if (!coin?.id) {
      setHistoricalData([])
      return
    }
    const cacheKey = `cached_coin_history_${coin.id}_${timeframe}`
    const cachedHistory = getCachedData(cacheKey, CACHE_DURATION_HISTORY_MS)

    if (cachedHistory) {
      setHistoricalData(cachedHistory)
      return
    }

    try {
      setRateLimitError(null)
      const response = await fetch(`/api/coin-history/${coin.id}?vs_currency=usd&days=${timeframe}`)
      const data = await response.json()

      if (!response.ok) {
        const errorText = await response.text()
        let errorData = { error: "Unknown error" }
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData.error = errorText
        }
        if (response.status === 429) {
          setRateLimitError("Rate limit exceeded for historical data. Please wait a moment before trying again.")
        }
        throw new Error(errorData.error || `Failed to fetch historical data: ${response.statusText}`)
      }

      setHistoricalData(data.prices || [])
      setCachedData(cacheKey, data.prices || [])
    } catch (error) {
      console.error("Error fetching historical data:", error)
      if (!rateLimitError) {
        setRateLimitError(error.message)
      }
      setLoading(false)
    }
  }

  const handleAddToPortfolio = () => {
    if (quantity && Number.parseFloat(quantity) > 0) {
      addToPortfolio(coin.id, Number.parseFloat(quantity))
      setQuantity("")
      alert("Added to portfolio!")
    }
  }

  if (loading || !coinData) {
    return (
      <div className="loading-container">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading coin details...</p>
      </div>
    )
  }

  return (
    <div className="coin-detail">
      <button className="back-btn" onClick={onBack}>
        0 Back to Dashboard
      </button>

      {rateLimitError && (
        <div className="error-message">
          <p>{rateLimitError}</p>
          <p>Please try again in a few moments.</p>
        </div>
      )}

      <div className="coin-header">
        <img
          src={coinData.image?.large || "/placeholder.svg?height=80&width=80"}
          alt={coinData.name}
          className="coin-detail-image"
        />
        <div className="coin-info">
          <h1>
            {coinData.name} ({coinData.symbol?.toUpperCase()})
          </h1>
          <div className="coin-price">
            <span className="current-price">${coinData.market_data?.current_price?.usd?.toFixed(2)}</span>
            <span
              className={`price-change ${coinData.market_data?.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}
            >
              {coinData.market_data?.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        </div>
        <button
          className={`watchlist-btn ${validatedWatchlist.includes(coin.id) ? "active" : ""}`}
          onClick={() => {
            if (validatedWatchlist.includes(coin.id)) {
              removeFromWatchlist(coin.id)
            } else {
              addToWatchlist(coin)
            }
          }}
        >
          {validatedWatchlist.includes(coin.id) ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
      </div>

      <div className="coin-stats">
        <div className="stat-item">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">${formatNumber(coinData.market_data?.market_cap?.usd)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${formatNumber(coinData.market_data?.total_volume?.usd)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Circulating Supply</span>
          <span className="stat-value">{formatNumber(coinData.market_data?.circulating_supply)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">All Time High</span>
          <span className="stat-value">${coinData.market_data?.ath?.usd?.toFixed(2)}</span>
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
        <text x="10" y="20" fill="#666" fontSize="12">
          ${maxPrice.toFixed(2)}
        </text>
        <text x="10" y="290" fill="#666" fontSize="12">
          ${minPrice.toFixed(2)}
        </text>
        {data.map((point, index) => {
          if (index === 0) return null
          const x1 = (index - 1) * (800 / (data.length - 1))
          const y1 = 280 - ((data[index - 1][1] - minPrice) / priceRange) * 260
          const x2 = index * (800 / (data.length - 1))
          const y2 = 280 - ((point[1] - minPrice) / priceRange) * 260
          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4CAF50" strokeWidth="2" />
        })}
      </svg>
    </div>
  )
}
