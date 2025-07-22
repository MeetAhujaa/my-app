"use client"

import { useState, useEffect } from "react"

export default function Portfolio({ portfolio, coins, removeFromPortfolio }) {
  const [portfolioData, setPortfolioData] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState({ coinId: "", threshold: "", type: "above" })

  const validatedPortfolio = Array.isArray(portfolio) ? portfolio : []
  const validatedCoins = Array.isArray(coins) ? coins : []

  useEffect(() => {
    calculatePortfolioValue()
    loadAlerts()
  }, [validatedPortfolio, validatedCoins])

  const calculatePortfolioValue = () => {
    const data = validatedPortfolio
      .map((item) => {
        const coin = validatedCoins.find((c) => c.id === item.coinId)
        if (coin) {
          const value = coin.current_price * item.quantity
          return {
            ...item,
            coin,
            value,
            change24h: (coin.price_change_percentage_24h * value) / 100,
          }
        }
        return null
      })
      .filter(Boolean)

    setPortfolioData(data)
    setTotalValue(data.reduce((sum, item) => sum + item.value, 0))
  }

  const loadAlerts = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("priceAlerts")
      if (saved) {
        setAlerts(JSON.parse(saved))
      }
    }
  }

  const saveAlerts = (alertsToSave) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("priceAlerts", JSON.stringify(alertsToSave))
    }
  }

  const addAlert = () => {
    if (newAlert.coinId && newAlert.threshold) {
      const alert = {
        id: Date.now(),
        coinId: newAlert.coinId,
        threshold: Number.parseFloat(newAlert.threshold),
        type: newAlert.type,
        triggered: false,
      }
      const updatedAlerts = [...alerts, alert]
      setAlerts(updatedAlerts)
      saveAlerts(updatedAlerts)
      setNewAlert({ coinId: "", threshold: "", type: "above" })
    }
  }

  const removeAlert = (alertId) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId)
    setAlerts(updatedAlerts)
    saveAlerts(updatedAlerts)
  }

  const checkAlerts = () => {
    alerts.forEach((alert) => {
      const coin = validatedCoins.find((c) => c.id === alert.coinId)
      if (coin && !alert.triggered) {
        const shouldTrigger =
          alert.type === "above" ? coin.current_price >= alert.threshold : coin.current_price <= alert.threshold

        if (shouldTrigger) {
          alert.triggered = true
          showNotification(coin, alert)
        }
      }
    })
  }

  const showNotification = (coin, alert) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(`Price Alert: ${coin.name}`, {
        body: `${coin.name} is now ${alert.type} $${alert.threshold}. Current price: $${coin.current_price?.toFixed(2)}`,
        icon: coin.image,
      })
    } else {
      alert(
        `Price Alert: ${coin.name} is now ${alert.type} $${alert.threshold}. Current price: $${coin.current_price?.toFixed(2)}`,
      )
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M"
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K"
    return num.toFixed(2)
  }

  const requestNotificationPermission = () => {
    if (typeof Notification !== "undefined") {
      Notification.requestPermission()
    }
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h2>My Portfolio</h2>
        <div className="portfolio-summary">
          <div className="total-value">
            <span className="label">Total Value:</span>
            <span className="value">${totalValue.toFixed(2)}</span>
          </div>
          <div className="total-change">
            <span className="label">24h Change:</span>
            <span
              className={`value ${portfolioData.reduce((sum, item) => sum + item.change24h, 0) >= 0 ? "positive" : "negative"}`}
            >
              ${portfolioData.reduce((sum, item) => sum + item.change24h, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {portfolioData.length === 0 ? (
        <div className="empty-portfolio">
          <p>Your portfolio is empty. Add some cryptocurrencies from the coin detail pages!</p>
        </div>
      ) : (
        <div className="portfolio-table">
          <div className="table-header">
            <div className="header-cell">Coin</div>
            <div className="header-cell">Quantity</div>
            <div className="header-cell">Price</div>
            <div className="header-cell">Value</div>
            <div className="header-cell">24h Change</div>
            <div className="header-cell">Actions</div>
          </div>

          {portfolioData.map((item) => (
            <div key={item.coinId} className="table-row">
              <div className="cell">
                <img
                  src={item.coin.image || "/placeholder.svg?height=32&width=32"}
                  alt={item.coin.name}
                  className="coin-image"
                />
                <div>
                  <div className="coin-name">{item.coin.name}</div>
                  <div className="coin-symbol">{item.coin.symbol?.toUpperCase()}</div>
                </div>
              </div>
              <div className="cell justify-end">{item.quantity}</div>
              <div className="cell">${item.coin.current_price?.toFixed(2)}</div>
              <div className="cell">${item.value.toFixed(2)}</div>
              <div className={`cell ${item.change24h >= 0 ? "positive" : "negative"}`}>
                ${item.change24h.toFixed(2)}
              </div>
              <div className="cell">
                <button className="remove-btn" onClick={() => removeFromPortfolio(item.coinId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="alerts-section">
        <div className="alerts-header">
          <h3>Price Alerts</h3>
          <button onClick={requestNotificationPermission} className="notification-btn">
            Enable Notifications
          </button>
        </div>

        <div className="add-alert">
          <select
            value={newAlert.coinId}
            onChange={(e) => setNewAlert({ ...newAlert, coinId: e.target.value })}
            className="alert-select"
          >
            <option value="">Select Coin</option>
            {validatedCoins.slice(0, 50).map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol?.toUpperCase()})
              </option>
            ))}
          </select>

          <select
            value={newAlert.type}
            onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
            className="alert-select"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>

          <input
            type="number"
            placeholder="Price threshold"
            value={newAlert.threshold}
            onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
            className="alert-input"
          />

          <button onClick={addAlert} className="add-alert-btn">
            Add Alert
          </button>
        </div>

        <div className="alerts-list">
          {alerts.map((alert) => {
            const coin = validatedCoins.find((c) => c.id === alert.coinId)
            return coin ? (
              <div key={alert.id} className={`alert-item ${alert.triggered ? "triggered" : ""}`}>
                <img
                  src={coin.image || "/placeholder.svg?height=24&width=24"}
                  alt={coin.name}
                  className="alert-coin-image"
                />
                <span className="alert-text">
                  {coin.name} {alert.type} ${alert.threshold}
                </span>
                <span className="alert-status">{alert.triggered ? "Triggered" : "Active"}</span>
                <button onClick={() => removeAlert(alert.id)} className="remove-alert-btn">
                  Remove
                </button>
              </div>
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}
