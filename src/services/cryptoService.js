import axios from 'axios';

const API_KEY = 'IyPBYsRAR1jV5dHd3eC6pzANyQy6GTUHeEUJ1JxrNFIiwwMzhy6Mnkne3DoYZCXZ';
const API_BASE_URL = 'https://api.binance.com/api/v3';
const NEWS_API_URL = 'https://cryptopanic.com/api/v1/posts';

let portfolio = {};

const handleApiError = (error) => {
  if (error.response) {
    return `API Error: ${error.response.data.message || 'Unknown error'}`;
  } else if (error.request) {
    return 'Network Error: Could not connect to the server';
  } else {
    return `Error: ${error.message}`;
  }
};

export const executeCommand = async (command) => {
  const [cmd, ...args] = command.toLowerCase().split(' ');

  switch (cmd) {
    case 'help':
      return `Available commands:
- price <symbol>: Get current price (e.g., price BTC)
- portfolio add <symbol> <amount> <price>: Add to portfolio
- portfolio view: View portfolio
- trend <symbol>: Show price trend
- convert <amount> <from> to <to>: Convert between currencies
- news: Get latest crypto news
- clear: Clear terminal
- help: Show this help message`;

    case 'price':
      return await getPrice(args[0]);

    case 'portfolio':
      if (args[0] === 'add') {
        return addToPortfolio(args[1], parseFloat(args[2]), parseFloat(args[3]));
      } else if (args[0] === 'view') {
        return viewPortfolio();
      }
      return 'Invalid portfolio command';

    case 'trend':
      return await getTrend(args[0]);

    case 'convert':
      return await convertCurrency(args);

    case 'news':
      return await getNews();

    case 'clear':
      return '\n'.repeat(50);

    default:
      return 'Unknown command. Type "help" for available commands.';
  }
};

async function getPrice(symbol) {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticker/price`, {
      params: { symbol: `${symbol.toUpperCase()}USDT` }
    });
    return `${symbol.toUpperCase()}: $${parseFloat(response.data.price).toFixed(2)}`;
  } catch (error) {
    return handleApiError(error);
  }
}

function addToPortfolio(symbol, amount, price) {
  if (!portfolio[symbol]) {
    portfolio[symbol] = [];
  }
  portfolio[symbol].push({ amount, price });
  return `Added ${amount} ${symbol} at $${price} to portfolio`;
}

async function viewPortfolio() {
  let output = 'Portfolio:\n';
  for (const [symbol, holdings] of Object.entries(portfolio)) {
    const currentPrice = await getCurrentPrice(symbol);
    const totalAmount = holdings.reduce((sum, h) => sum + h.amount, 0);
    const avgPrice = holdings.reduce((sum, h) => sum + h.price * h.amount, 0) / totalAmount;
    const currentValue = totalAmount * currentPrice;
    const profitLoss = currentValue - (totalAmount * avgPrice);
    
    output += `${symbol}: ${totalAmount} (Avg: $${avgPrice.toFixed(2)})\n`;
    output += `Current Value: $${currentValue.toFixed(2)}\n`;
    output += `P/L: $${profitLoss.toFixed(2)}\n\n`;
  }
  return output;
}

async function getCurrentPrice(symbol) {
  try {
    const response = await axios.get(`${API_BASE_URL}/ticker/price`, {
      params: { symbol: `${symbol.toUpperCase()}USDT` }
    });
    return parseFloat(response.data.price);
  } catch (error) {
    return 0;
  }
}

async function getTrend(symbol) {
  try {
    const response = await axios.get(`${API_BASE_URL}/klines`, {
      params: {
        symbol: `${symbol.toUpperCase()}USDT`,
        interval: '1h',
        limit: 24
      }
    });
    
    const prices = response.data.map(k => parseFloat(k[4]));
    const trend = prices.map((price, i) => {
      if (i === 0) return '•';
      return price > prices[i - 1] ? '↑' : '↓';
    }).join(' ');
    
    return `${symbol.toUpperCase()} 24h trend:\n${trend}`;
  } catch (error) {
    return `Error fetching trend for ${symbol}`;
  }
}

async function convertCurrency(args) {
  const [amount, from, , to] = args;
  try {
    const response = await axios.get(`${API_BASE_URL}/ticker/price`, {
      params: { symbol: `${from.toUpperCase()}USDT` }
    });
    const price = parseFloat(response.data.price);
    const converted = parseFloat(amount) * price;
    return `${amount} ${from.toUpperCase()} = $${converted.toFixed(2)}`;
  } catch (error) {
    return 'Error converting currency';
  }
}

async function getNews() {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        auth_token: API_KEY,
        currencies: 'BTC,ETH',
        public: true
      }
    });
    
    return response.data.results
      .slice(0, 5)
      .map(news => `• ${news.title}`)
      .join('\n');
  } catch (error) {
    return 'Error fetching news';
  }
} 