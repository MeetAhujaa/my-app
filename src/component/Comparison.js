"use client"

import { useState, useEffect } from "react"

const API_KEY = "HZTpvYhBm3hm7utTkkaK1V6t44QoFwVLGt9NqF0jX1PPMV4gC6ijfNMRDEtyU3lY"

function Comparison({ coins }) {
  const [selectedCoins, setSelectedCoins] = useState([])
  const [timeframe, setTimeframe] = useState("7")
  const [comparisonData, setComparisonData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCoins.length > 0) {
      fetchComparisonData()
    }
  }, [selectedCoins, timeframe])

  const fetchComparisonData = async () => {
    setLoading(true)
    const data = {}

    for (const coinId of selectedCoins) {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${timeframe}&x_cg_demo_api_key=${API_KEY}`,
        )
        const result = await response.json()
        data[coinId] = result.prices || []
      } catch (error) {
        console.error(`Error fetching data for ${coinId}:`, error)
      }
    }

    setComparisonData(data)
    setLoading(false)
  }

  const addCoin = (coinId) => {
    if (!selectedCoins.includes(coinId) && selectedCoins.length < 5) {
      setSelectedCoins([...selectedCoins, coinId])
    }
  }

  const removeCoin = (coinId) => {
    setSelectedCoins(selectedCoins.filter((id) => id !== coinId))
  }

  const getColorForIndex = (index) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
    return colors[index % colors.length]
  }

  return (
    <div className="comparison">
      <h2>Cryptocurrency Comparison</h2>

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
            {coins.slice(0, 50).map((coin) => (
              <option key={coin.id} value={coin.id} disabled={selectedCoins.includes(coin.id)}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="timeframe-selector">
          <h3>Timeframe</h3>
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
        {selectedCoins.map((coinId, index) => {
          const coin = coins.find((c) => c.id === coinId)
          return coin ? (
            <div key={coinId} className="selected-coin" style={{ borderColor: getColorForIndex(index) }}>
              <img src={coin.image || "/placeholder.svg?height=32&width=32"} alt={coin.name} className="coin-image" />
              <span className="coin-name">{coin.name}</span>
              <button onClick={() => removeCoin(coinId)} className="remove-coin-btn">
                ×
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

      {selectedCoins.length > 0 && !loading && (
        <div className="comparison-chart">
          <h3>Price Performance Comparison (%)</h3>
          <ComparisonChart
            data={comparisonData}
            selectedCoins={selectedCoins}
            coins={coins}
            getColorForIndex={getColorForIndex}
          />
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

            {selectedCoins.map((coinId, index) => {
              const coin = coins.find((c) => c.id === coinId)
              return coin ? (
                <div key={coinId} className="table-row">
                  <div className="cell">
                    <div className="color-indicator" style={{ backgroundColor: getColorForIndex(index) }}></div>
                    <img
                      src={coin.image || "/placeholder.svg?height=32&width=32"}
                      alt={coin.name}
                      className="coin-image"
                    />
                    <span>{coin.name}</span>
                  </div>
                  <div className="cell">${coin.current_price.toFixed(2)}</div>
                  <div className={`cell ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}`}>
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </div>
                  <div className="cell">${(coin.market_cap / 1e9).toFixed(2)}B</div>
                  <div className="cell">${(coin.total_volume / 1e6).toFixed(2)}M</div>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ComparisonChart({ data, selectedCoins, coins, getColorForIndex }) {
  if (Object.keys(data).length === 0) return null

  // Find the common time range
  const allDataPoints = Object.values(data).flat()
  if (allDataPoints.length === 0) return null

  const minTime = Math.min(...allDataPoints.map((point) => point[0]))
  const maxTime = Math.max(...allDataPoints.map((point) => point[0]))

  // Normalize all data to percentage change
  const normalizedData = {}
  selectedCoins.forEach((coinId) => {
    if (data[coinId] && data[coinId].length > 0) {
      const basePrice = data[coinId][0][1]
      normalizedData[coinId] = data[coinId].map((point) => [point[0], ((point[1] - basePrice) / basePrice) * 100])
    }
  })

  const allPercentages = Object.values(normalizedData)
    .flat()
    .map((point) => point[1])
  const maxPercentage = Math.max(...allPercentages)
  const minPercentage = Math.min(...allPercentages)
  const percentageRange = maxPercentage - minPercentage

  return (
    <div className="chart-container">
      <svg width="100%" height="400" viewBox="0 0 800 400">
        <defs>
          {selectedCoins.map((coinId, index) => (
            <linearGradient key={coinId} id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={getColorForIndex(index)} stopOpacity="0.3" />
              <stop offset="100%" stopColor={getColorForIndex(index)} stopOpacity="0.1" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="url(#grid)" />

        {/* Y-axis labels */}
        <text x="10" y="20" fill="#666" fontSize="12">
          {maxPercentage.toFixed(1)}%
        </text>
        <text x="10" y="200" fill="#666" fontSize="12">
          0%
        </text>
        <text x="10" y="380" fill="#666" fontSize="12">
          {minPercentage.toFixed(1)}%
        </text>

        {/* Draw lines for each coin */}
        {selectedCoins.map((coinId, index) => {
          const coinData = normalizedData[coinId]
          if (!coinData || coinData.length === 0) return null

          const color = getColorForIndex(index)
          const timeRange = maxTime - minTime

          return (
            <g key={coinId}>
              {coinData.map((point, pointIndex) => {
                if (pointIndex === 0) return null

                const x1 = ((coinData[pointIndex - 1][0] - minTime) / timeRange) * 780 + 10
                const y1 = 380 - ((coinData[pointIndex - 1][1] - minPercentage) / percentageRange) * 360
                const x2 = ((point[0] - minTime) / timeRange) * 780 + 10
                const y2 = 380 - ((point[1] - minPercentage) / percentageRange) * 360

                return <line key={pointIndex} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
              })}
            </g>
          )
        })}

        {/* Legend */}
        {selectedCoins.map((coinId, index) => {
          const coin = coins.find((c) => c.id === coinId)
          if (!coin) return null

          return (
            <g key={coinId}>
              <rect x={10 + index * 120} y={10} width={12} height={12} fill={getColorForIndex(index)} />
              <text x={25 + index * 120} y={20} fill="#333" fontSize="12">
                {coin.symbol.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default Comparison
