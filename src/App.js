"use client"

import { useState, useEffect } from "react"
import "./App.css"
import Dashboard from "./components/Dashboard"
import CoinDetail from "./components/CoinDetail"
import Portfolio from "./components/Portfolio"
import Watchlist from "./components/Watchlist"
import Comparison from "./components/Comparison"

const API_KEY = "HZTpvYhBm3hm7utTkkaK1V6t44QoFwVLGt9NqF0jX1PPMV4gC6ijfNMRDEtyU3lY"

function App() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState([])
  const [portfolio, setPortfolio] = useState([])

  useEffect(() => {
    fetchCoins()
    loadWatchlist()
    loadPortfolio()
  }, [])

  const fetchCoins = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=${API_KEY}`,
      )
      const data = await response.json()
      setCoins(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching coins:", error)
      setLoading(false)
    }
  }

  const loadWatchlist = () => {
    const saved = localStorage.getItem("watchlist")
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }
  }

  const loadPortfolio = () => {
    const saved = localStorage.getItem("portfolio")
    if (saved) {
      setPortfolio(JSON.parse(saved))
    }
  }

  const addToWatchlist = (coin) => {
    const newWatchlist = [...watchlist, coin.id]
    setWatchlist(newWatchlist)
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
  }

  const removeFromWatchlist = (coinId) => {
    const newWatchlist = watchlist.filter((id) => id !== coinId)
    setWatchlist(newWatchlist)
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
  }

  const addToPortfolio = (coinId, quantity) => {
    const newPortfolio = [...portfolio, { coinId, quantity }]
    setPortfolio(newPortfolio)
    localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
  }

  const removeFromPortfolio = (coinId) => {
    const newPortfolio = portfolio.filter((item) => item.coinId !== coinId)
    setPortfolio(newPortfolio)
    localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            coins={coins}
            loading={loading}
            onCoinClick={(coin) => {
              setSelectedCoin(coin)
              setCurrentView("coin-detail")
            }}
            watchlist={watchlist}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
          />
        )
      case "coin-detail":
        return (
          <CoinDetail
            coin={selectedCoin}
            onBack={() => setCurrentView("dashboard")}
            watchlist={watchlist}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
            addToPortfolio={addToPortfolio}
          />
        )
      case "portfolio":
        return <Portfolio portfolio={portfolio} coins={coins} removeFromPortfolio={removeFromPortfolio} />
      case "watchlist":
        return (
          <Watchlist
            watchlist={watchlist}
            coins={coins}
            removeFromWatchlist={removeFromWatchlist}
            onCoinClick={(coin) => {
              setSelectedCoin(coin)
              setCurrentView("coin-detail")
            }}
          />
        )
      case "comparison":
        return <Comparison coins={coins} />
      default:
        return null
    }
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">CryptoTracker</h1>
          <div className="nav-links">
            <button
              className={currentView === "dashboard" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={currentView === "portfolio" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentView("portfolio")}
            >
              Portfolio
            </button>
            <button
              className={currentView === "watchlist" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentView("watchlist")}
            >
              Watchlist
            </button>
            <button
              className={currentView === "comparison" ? "nav-link active" : "nav-link"}
              onClick={() => setCurrentView("comparison")}
            >
              Compare
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{renderCurrentView()}</main>
    </div>
  )
}

export default App
