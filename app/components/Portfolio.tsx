"use client"

import { useState, useEffect } from "react"

export default function Portfolio({ portfolio, coins, removeFromPortfolio }) {
  const [portfolioData, setPortfolioData] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState({ coinId: "", threshold: "", type: "above" })

  const portfolioArray = Array.isArray(portfolio) ? portfolio : []
  const coinsArray = Array.isArray(coins) ? coins : []

  useEffect(() => {
    calculatePortfolioValue()
    loadAlerts()
  }, [portfolioArray, coinsArray])

  const calculatePortfolioValue = () => {
    const data = portfolioArray
      .map((item) => {
        const coin = coinsArray.find((c) => c.id === item.coinId)
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>
        <div className="flex gap-8">
          <div>
            <span className="text-gray-600">Total Value:</span>
            <span className="text-2xl font-bold ml-2">${totalValue.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">24h Change:</span>
            <span
              className={`text-xl font-bold ml-2 ${
                portfolioData.reduce((sum, item) => sum + item.change24h, 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${portfolioData.reduce((sum, item) => sum + item.change24h, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {portfolioData.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-lg text-center">
          <p className="text-gray-600">
            Your portfolio is empty. Add some cryptocurrencies from the coin detail pages!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg font-semibold text-gray-600 text-sm">
                <div>Coin</div>
                <div>Quantity</div>
                <div>Price</div>
                <div>Value</div>
                <div>24h Change</div>
                <div>Actions</div>
              </div>

              {portfolioData.map((item) => (
                <div key={item.coinId} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.coin.image || "/placeholder.svg?height=32&width=32"}
                      alt={item.coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{item.coin.name}</div>
                      <div className="text-sm text-gray-500">{item.coin.symbol?.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="flex items-center">{item.quantity}</div>
                  <div className="flex items-center">${item.coin.current_price?.toFixed(2)}</div>
                  <div className="flex items-center">${item.value.toFixed(2)}</div>
                  <div className={`flex items-center ${item.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${item.change24h.toFixed(2)}
                  </div>
                  <div className="flex items-center">
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      onClick={() => removeFromPortfolio(item.coinId)}
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

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Price Alerts</h3>
          <button
            onClick={() => {
              if (typeof Notification !== "undefined") {
                Notification.requestPermission()
              }
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            Enable Notifications
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={newAlert.coinId}
            onChange={(e) => setNewAlert({ ...newAlert, coinId: e.target.value })}
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select Coin</option>
            {coinsArray.slice(0, 50).map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol?.toUpperCase()})
              </option>
            ))}
          </select>

          <select
            value={newAlert.type}
            onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>

          <input
            type="number"
            placeholder="Price threshold"
            value={newAlert.threshold}
            onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />

          <button
            onClick={addAlert}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Alert
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => {
            const coin = coinsArray.find((c) => c.id === alert.coinId)
            return coin ? (
              <div
                key={alert.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                  alert.triggered ? "border-green-500 bg-green-50" : "border-blue-500 bg-gray-50"
                }`}
              >
                <img
                  src={coin.image || "/placeholder.svg?height=24&width=24"}
                  alt={coin.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="flex-1">
                  {coin.name} {alert.type} ${alert.threshold}
                </span>
                <span className="text-sm text-gray-600">{alert.triggered ? "Triggered" : "Active"}</span>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
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
