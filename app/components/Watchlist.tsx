"use client"

export default function Watchlist({ watchlist, coins, removeFromWatchlist, onCoinClick }) {
  const watchlistArray = Array.isArray(watchlist) ? watchlist : []
  const coinsArray = Array.isArray(coins) ? coins : []

  const watchlistCoins = coinsArray.filter((coin) => watchlistArray.includes(coin.id))

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Watchlist</h2>

      {watchlistCoins.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center">
          <p className="text-gray-600">Your watchlist is empty. Add some cryptocurrencies from the dashboard!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-lg">
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

              {watchlistCoins.map((coin) => (
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
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      onClick={() => removeFromWatchlist(coin.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
