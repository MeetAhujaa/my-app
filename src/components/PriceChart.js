import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PriceChart({ symbol }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
          params: {
            symbol: `${symbol}USDT`,
            interval: '1h',
            limit: 24
          }
        });
        
        const data = response.data.map(candle => ({
          time: new Date(candle[0]).toLocaleTimeString(),
          price: parseFloat(candle[4])
        }));
        
        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol]);

  if (loading) {
    return <div className="loading">Loading chart...</div>;
  }

  return (
    <div className="price-chart">
      <div className="chart">
        {chartData.map((point, index) => (
          <div
            key={index}
            className="chart-bar"
            style={{
              height: `${(point.price / Math.max(...chartData.map(d => d.price))) * 100}%`
            }}
            title={`${point.time}: $${point.price}`}
          />
        ))}
      </div>
      <div className="chart-labels">
        {chartData.map((point, index) => (
          <span key={index} className="chart-label">
            {point.time}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PriceChart; 