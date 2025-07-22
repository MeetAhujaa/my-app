"use client"

export default function Watchlist({ watchlist, coins, removeFromWatchlist, onCoinClick }) {
  const validatedWatchlist = Array.isArray(watchlist) ? watchlist : []
  const validatedCoins = Array.isArray(coins) ? coins : []
  const watchlistCoins = validatedCoins.filter((coin) => validatedWatchlist.includes(coin.id))
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T"
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }
  return (
    <div className="watchlist">
      <h2>My Watchlist</h2>
      {watchlistCoins.length === 0 ? (
        <div className="empty-watchlist">
          <p>Your watchlist is empty. Add some cryptocurrencies from the dashboard!</p>
        </div>
      ) : (
        <div className="watchlist-table">
          <div className="table-header">
            <div className="header-cell rank">#</div>
            <div className="header-cell name">Name</div>
            <div className="header-cell price">Price</div>
            <div className="header-cell change">24h Change</div>
            <div className="header-cell market-cap">Market Cap</div>
            <div className="header-cell volume">Volume (24h)</div>
            <div className="header-cell actions">Actions</div>
          </div>
          {watchlistCoins.map((coin) => (
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
                <button className="remove-btn" onClick={() => removeFromWatchlist(coin.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
