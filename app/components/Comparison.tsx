"use client"

import { useState, useEffect } from "react"

// Removed the API_KEY constant as it's not needed for the public CoinGecko API endpoints.
// const API_KEY = "HZTpvYhBm3hm7utTkkaK1V6t44QoFwVLGt9NqF0jX1PPMV4gC6ijfNMRDEtyU3lY"

export default function Comparison({ coins }) {
  const [selectedCoins, setSelectedCoins] = useState([])
  const [timeframe, setTimeframe] = useState("7")
  const [comparisonData, setComparisonData] = useState({})
  const [loading, setLoading] = useState(false)

  const coinsArray = Array.isArray(coins) ? coins : []

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
        // Removed x_cg_demo_api_key from the URL
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${timeframe}`,
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
    const colors = ["#EF4444", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cryptocurrency Comparison</h2>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Coins to Compare (Max 5)</h3>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addCoin(e.target.value)
                  e.target.value = ""
                }
              }}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choose a cryptocurrency...</option>
              {coinsArray.slice(0, 50).map((coin) => (
                <option key={coin.id} value={coin.id} disabled={selectedCoins.includes(coin.id)}>
                  {coin.name} ({coin.symbol?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Timeframe</h3>
            <div className="flex gap-2">
              {["1", "7", "30", "90", "365"].map((days) => (
                <button
                  key={days}
                  className={`px-3 py-1 rounded transition-colors ${
                    timeframe === days ? "bg-blue-600 text-white" : "border border-gray-300 hover:border-blue-500"
                  }`}
                  onClick={() => setTimeframe(days)}
                >
                  {days === "1" ? "1D" : days === "7" ? "1W" : days === "30" ? "1M" : days === "90" ? "3M" : "1Y"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCoins.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedCoins.map((coinId, index) => {
            const coin = coinsArray.find((c) => c.id === coinId)
            return coin ? (
              <div
                key={coinId}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border-2"
                style={{ borderColor: getColorForIndex(index) }}
              >
                <img
                  src={coin.image || "/placeholder.svg?height=24&width=24"}
                  alt={coin.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{coin.name}</span>
                <button
                  onClick={() => removeCoin(coinId)}
                  className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : null
          })}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      )}

      {selectedCoins.length > 0 && !loading && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Price Performance Comparison (%)</h3>
          <ComparisonChart
            data={comparisonData}
            selectedCoins={selectedCoins}
            coins={coinsArray}
            getColorForIndex={getColorForIndex}
          />
        </div>
      )}

      {selectedCoins.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Current Statistics</h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg font-semibold text-gray-600 text-sm">
                <div>Coin</div>
                <div>Price</div>
                <div>24h Change</div>
                <div>Market Cap</div>
                <div>Volume</div>
              </div>

              {selectedCoins.map((coinId, index) => {
                const coin = coinsArray.find((c) => c.id === coinId)
                return coin ? (
                  <div key={coinId} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorForIndex(index) }}></div>
                      <img
                        src={coin.image || "/placeholder.svg?height=24&width=24"}
                        alt={coin.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{coin.name}</span>
                    </div>
                    <div>${coin.current_price?.toFixed(2)}</div>
                    <div className={coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"}>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </div>
                    <div>${(coin.market_cap / 1e9).toFixed(2)}B</div>
                    <div>${(coin.total_volume / 1e6).toFixed(2)}M</div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ComparisonChart({ data, selectedCoins, coins, getColorForIndex }) {
  if (Object.keys(data).length === 0) return null

  const coinsArray = Array.isArray(coins) ? coins : []

  const allDataPoints = Object.values(data).flat()
  if (allDataPoints.length === 0) return null

  const minTime = Math.min(...allDataPoints.map((point) => point[0]))
  const maxTime = Math.max(...allDataPoints.map((point) => point[0]))

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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <svg width="100%" height="400" viewBox="0 0 800 400" className="w-full h-auto">
        <text x="10" y="20" fill="#666" fontSize="12">
          {maxPercentage.toFixed(1)}%
        </text>
        <text x="10" y="200" fill="#666" fontSize="12">
          0%
        </text>
        <text x="10" y="380" fill="#666" fontSize="12">
          {minPercentage.toFixed(1)}%
        </text>

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

        {selectedCoins.map((coinId, index) => {
          const coin = coinsArray.find((c) => c.id === coinId)
          if (!coin) return null

          return (
            <g key={coinId}>
              <rect x={10 + index * 120} y={10} width={12} height={12} fill={getColorForIndex(index)} />
              <text x={25 + index * 120} y={20} fill="#333" fontSize="12">
                {coin.symbol?.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
