"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Dashboard from "../components/Dashboard.jsx"
import CoinDetail from "../components/CoinDetail.jsx"
import Portfolio from "../components/Portfolio.jsx"
import Watchlist from "../components/Watchlist.jsx"
import Comparison from "../components/Comparison.jsx"
import { getCachedData, setCachedData, CACHE_DURATION_COINS_MS } from "../../lib/cache.js"

export default function AuthStatus({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [coins, setCoins] = useState([])
  const [loadingCoins, setLoadingCoins] = useState(true)
  const [watchlist, setWatchlist] = useState([])
  const [portfolio, setPortfolio] = useState([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loggedIn)
      setLoadingAuth(false)
      if (!loggedIn && !["/login", "/signup"].includes(pathname)) {
        router.replace("/login")
      } else if (loggedIn && ["/login", "/signup"].includes(pathname)) {
        router.replace("/")
      }
    }
  }, [pathname, router])

  useEffect(() => {
    if (isLoggedIn) {
      fetchCoins()
      loadWatchlist()
      loadPortfolio()
    }
  }, [isLoggedIn])

  const fetchCoins = async () => {
    const cacheKey = "cached_coins_list"
    const cachedCoins = getCachedData(cacheKey, CACHE_DURATION_COINS_MS)
    if (cachedCoins) {
      setCoins(cachedCoins)
      setLoadingCoins(false)
      return
    }
    try {
      const response = await fetch(
        `/api/coins?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
      )
      if (!response.ok) {
        const errorText = await response.text()
        let errorData = { error: "Unknown error" }
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData.error = errorText
        }
        throw new Error(errorData.error || `Failed to fetch coins: ${response.statusText}`)
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setCoins(data)
        setCachedData(cacheKey, data)
      } else {
        setCoins([])
      }
      setLoadingCoins(false)
    } catch (error) {
      setCoins([])
      setLoadingCoins(false)
    }
  }

  const loadWatchlist = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchlist")
      if (saved) {
        setWatchlist(JSON.parse(saved))
      }
    }
  }

  const loadPortfolio = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio")
      if (saved) {
        setPortfolio(JSON.parse(saved))
      }
    }
  }

  const addToWatchlist = (coin) => {
    const newWatchlist = [...watchlist, coin.id]
    setWatchlist(newWatchlist)
    if (typeof window !== "undefined") {
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }
  }

  const removeFromWatchlist = (coinId) => {
    const newWatchlist = watchlist.filter((id) => id !== coinId)
    setWatchlist(newWatchlist)
    if (typeof window !== "undefined") {
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }
  }

  const addToPortfolio = (coinId, quantity) => {
    const newPortfolio = [...portfolio, { coinId, quantity }]
    setPortfolio(newPortfolio)
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
    }
  }

  const removeFromPortfolio = (coinId) => {
    const newPortfolio = portfolio.filter((item) => item.coinId !== coinId)
    setPortfolio(newPortfolio)
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio", JSON.stringify(newPortfolio))
    }
  }

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn")
      setIsLoggedIn(false)
      router.push("/login")
    }
  }

  const renderCurrentView = () => {
    const coinsArray = Array.isArray(coins) ? coins : []
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            coins={coinsArray}
            loading={loadingCoins}
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
        return <Portfolio portfolio={portfolio} coins={coinsArray} removeFromPortfolio={removeFromPortfolio} />
      case "watchlist":
        return (
          <Watchlist
            watchlist={watchlist}
            coins={coinsArray}
            removeFromWatchlist={removeFromWatchlist}
            onCoinClick={(coin) => {
              setSelectedCoin(coin)
              setCurrentView("coin-detail")
            }}
          />
        )
      case "comparison":
        return <Comparison coins={coinsArray} />
      default:
        return null
    }
  }

  if (loadingAuth) {
    return (
      <div className="loading-container">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Checking authentication status...</p>
      </div>
    )
  }

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-title">CryptoTracker</h1>
          <div className="nav-links">
            {isLoggedIn ? (
              <>
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
                <button className="nav-link" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  Login
                </Link>
                <Link href="/signup" className="nav-link">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        {isLoggedIn
          ? renderCurrentView()
          : children}
      </main>
    </div>
  )
}
