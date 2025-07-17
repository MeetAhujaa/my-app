"use client"

import { useState, useEffect } from "react"

// Removed the API_KEY constant as it's not needed for the public CoinGecko API endpoints.
// const API_KEY = "HZTpvYhBm3hm7utTkkaK1V6t44QoFwVLGt9NqF0jX1PPMV4gC6ijfNMRDEtyU3lY"

export default function CoinDetail({ coin, onBack, watchlist, addToWatchlist, removeFromWatchlist, addToPortfolio }) {
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
      // Removed x_cg_demo_api_key from the URL
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`)
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
      // Removed x_cg_demo_api_key from the URL
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${timeframe}`,
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
    if (num === undefined || num === null) return "N/A"
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  if (loading || !coinData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading coin details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-gray-200">
          <img
            src={coinData.image?.large || "/placeholder.svg?height=80&width=80"}
            alt={coinData.name}
            className="w-20 h-20 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {coinData.name} ({coinData.symbol?.toUpperCase()})
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${coinData.market_data?.current_price?.usd?.toFixed(2)}</span>
              <span
                className={`text-xl font-semibold ${
                  coinData.market_data?.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {coinData.market_data?.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          </div>
          <button
            className={`px-6 py-2 rounded-lg transition-colors ${
              watchlist.includes(coin.id)
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Market Cap</div>
            <div className="text-xl font-bold">${formatNumber(coinData.market_data?.market_cap?.usd)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">24h Volume</div>
            <div className="text-xl font-bold">${formatNumber(coinData.market_data?.total_volume?.usd)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Circulating Supply</div>
            <div className="text-xl font-bold">{formatNumber(coinData.market_data?.circulating_supply)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">All Time High</div>
            <div className="text-xl font-bold">${coinData.market_data?.ath?.usd?.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Add to Portfolio</h3>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAddToPortfolio}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add to Portfolio
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h3 className="text-xl font-bold">Price Chart</h3>
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
        {historicalData.length > 0 && <SimpleChart data={historicalData} />}
      </div>

      {coinData.description?.en && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">About {coinData.name}</h3>
          <p className="text-gray-700 leading-relaxed">{coinData.description.en.split(".")[0] + "."}</p>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <svg width="100%" height="300" viewBox="0 0 800 300" className="w-full h-auto">
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

          return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="2" />
        })}
      </svg>
    </div>
  )
}
