"use client"

import { useState, useEffect } from "react"
import { getCachedData, setCachedData, CACHE_DURATION_GLOBAL_MS } from "../../lib/cache.js"
import { formatNumber } from "../../lib/utils.js"

export default function Dashboard({ coins, loading, onCoinClick, watchlist, addToWatchlist, removeFromWatchlist }) {
  const validatedCoins = Array.isArray(coins) ? coins : []
  const validatedWatchlist = Array.isArray(watchlist) ? watchlist : []

  const [searchTerm, setSearchTerm] = useState("")
  const [marketData, setMarketData] = useState(null)
  const [rateLimitError, setRateLimitError] = useState(null)

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    const cacheKey = "cached_global_market_data"
    const cachedData = getCachedData(cacheKey, CACHE_DURATION_GLOBAL_MS)

    if (cachedData) {
      setMarketData(cachedData)
      return
    }

    try {
      setRateLimitError(null)
      const response = await fetch("/api/global-market")

      if (!response.ok) {
        const errorText = await response.text()
        let errorData = { error: "Unknown error" }
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData.error = errorText
        }

        if (response.status === 429) {
          setRateLimitError("Rate limit exceeded for global market data. Please wait a moment before trying again.")
        }
        throw new Error(errorData.error || `Failed to fetch global market data: ${response.statusText}`)
      }

      const data = await response.json()
      setMarketData(data)
      setCachedData(cacheKey, data)
    } catch (error) {
      console.error("Error fetching market data:", error)
      if (!rateLimitError) {
        setRateLimitError(error.message)
      }
    }
  }

  const filteredCoins = validatedCoins.filter(
    (coin) =>
      coin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading cryptocurrency data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {rateLimitError && (
        <div className="error-message">
          <p>{rateLimitError}</p>
          <p>Please try again in a few moments, or consider upgrading your CoinGecko API plan.</p>
        </div>
      )}

      {marketData && (
        <div className="market-overview">
          <h2>Global Market Overview</h2>
          <div className="market-stats">
            <div className="stat-card">
              <h3>Total Market Cap</h3>
              <p>${formatNumber(marketData.total_market_cap?.usd)}</p>
            </div>
            <div className="stat-card">
              <h3>24h Volume</h3>
              <p>${formatNumber(marketData.total_volume?.usd)}</p>
            </div>
            <div className="stat-card">
              <h3>Bitcoin Dominance</h3>
              <p>{marketData.market_cap_percentage?.btc?.toFixed(1)}%</p>
            </div>
            <div className="stat-card">
              <h3>Active Cryptocurrencies</h3>
              <p>{marketData.active_cryptocurrencies?.toLocaleString()}</p>
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

          {filteredCoins.slice(0, 50).map((coin) => (
            <div key={coin.id} className="table-row">
              <div className="cell rank">{coin.market_cap_rank}</div>
              <div className="cell name" onClick={() => onCoinClick(coin)}>
                <img src={coin.image || "/placeholder.svg?height=32&width=32"} alt={coin.name} className="coin-image" />
                <div>
                  <div className="coin-name">{coin.name}</div>
                  <div className="coin-symbol">{coin.symbol?.toUpperCase()}</div>
                </div>
              </div>
              <div className="cell price">${coin.current_price?.toFixed(2)}</div>
              <div className={`cell change ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}>
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
              <div className="cell market-cap">${formatNumber(coin.market_cap)}</div>
              <div className="cell volume">${formatNumber(coin.total_volume)}</div>
              <div className="cell actions">
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
                  {validatedWatchlist.includes(coin.id) ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
