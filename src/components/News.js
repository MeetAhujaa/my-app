import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://cryptopanic.com/api/v1/posts', {
          params: {
            auth_token: 'IyPBYsRAR1jV5dHd3eC6pzANyQy6GTUHeEUJ1JxrNFIiwwMzhy6Mnkne3DoYZCXZ',
            currencies: 'BTC,ETH',
            public: true
          }
        });
        setNews(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="loading">Loading news...</div>;
  }

  return (
    <div className="news">
      <h1>Latest Cryptocurrency News</h1>
      <div className="news-grid">
        {news.map((item, index) => (
          <div key={index} className="news-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="news-meta">
              <span>{new Date(item.published_at).toLocaleDateString()}</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Read More
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News; 