"use client"

import { useState, useEffect } from "react"

export default function Dashboard({ coins, loading, onCoinClick, watchlist, addToWatchlist, removeFromWatchlist }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [marketData, setMarketData] = useState(null)

  const coinsArray = Array.isArray(coins) ? coins : []
  const watchlistArray = Array.isArray(watchlist) ? watchlist : []

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    try {
      // Removed x_cg_demo_api_key from the URL
      const response = await fetch("https://api.coingecko.com/api/v3/global")
      const data = await response.json()
      setMarketData(data.data)
    } catch (error) {
      console.error("Error fetching market data:", error)
    }
  }

  const filteredCoins = coinsArray.filter(
    (coin) =>
      coin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading cryptocurrency data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {marketData && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Global Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-lg text-center">
              <h3 className="text-sm opacity-90 mb-2">Total Market Cap</h3>
              <p className="text-xl font-bold">${formatNumber(marketData.total_market_cap?.usd)}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-lg text-center">
              <h3 className="text-sm opacity-90 mb-2">24h Volume</h3>
              <p className="text-xl font-bold">${formatNumber(marketData.total_volume?.usd)}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-lg text-center">
              <h3 className="text-sm opacity-90 mb-2">Bitcoin Dominance</h3>
              <p className="text-xl font-bold">{marketData.market_cap_percentage?.btc?.toFixed(1)}%</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-lg text-center">
              <h3 className="text-sm opacity-90 mb-2">Active Cryptocurrencies</h3>
              <p className="text-xl font-bold">{marketData.active_cryptocurrencies?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Top 100 Cryptocurrencies</h2>
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none w-full md:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg font-semibold text-gray-600 text-sm">
              <div>#</div>
              <div>Name</div>
              <div>Price</div>
              <div>24h Change</div>
              <div>Market Cap</div>
              <div>Volume (24h)</div>
              <div>Actions</div>
            </div>

            {filteredCoins.slice(0, 50).map((coin) => (
              <div
                key={coin.id}
                className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">{coin.market_cap_rank}</div>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                  onClick={() => onCoinClick(coin)}
                >
                  <img
                    src={coin.image || "/placeholder.svg?height=32&width=32"}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-sm text-gray-500">{coin.symbol?.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center">${coin.current_price?.toFixed(2)}</div>
                <div
                  className={`flex items-center ${coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
                <div className="flex items-center">${formatNumber(coin.market_cap)}</div>
                <div className="flex items-center">${formatNumber(coin.total_volume)}</div>
                <div className="flex items-center">
                  <button
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      watchlistArray.includes(coin.id)
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 hover:border-blue-500"
                    }`}
                    onClick={() => {
                      if (watchlistArray.includes(coin.id)) {
                        removeFromWatchlist(coin.id)
                      } else {
                        addToWatchlist(coin)
                      }
                    }}
                  >
                    {watchlistArray.includes(coin.id) ? "★" : "☆"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
